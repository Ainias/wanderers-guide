import { characterState } from '@atoms/characterAtoms';
import { drawerState } from '@atoms/navAtoms';
import { ActionSymbol } from '@common/Actions';
import IndentedText from '@common/IndentedText';
import RichText from '@common/RichText';
import TraitsDisplay from '@common/TraitsDisplay';
import { TEXT_INDENT_AMOUNT } from '@constants/data';
import { fetchContentById } from '@content/content-store';
import ShowInjectedText from '@drawers/ShowInjectedText';
import ShowOperationsButton from '@drawers/ShowOperationsButton';
import { Title, Text, Image, Loader, Group, Divider, Stack, Box, Flex, List, Anchor, Button } from '@mantine/core';
import {
  determineFilteredSelectionList,
  getSelectedCustomOption,
  getSelectedOption,
  ObjectWithUUID,
  sortObjectByName,
} from '@operations/operation-utils';
import { useQuery } from '@tanstack/react-query';
import { AbilityBlock } from '@typing/content';
import { Operation, OperationSelect, OperationSelectFilters, OperationSelectOptionCustom } from '@typing/operations';
import { toLabel } from '@utils/strings';
import { instanceOfOperationSelectOptionCustom } from '@utils/type-fixing';
import { useEffect, useState } from 'react';
import { useRecoilState, useRecoilValue } from 'recoil';

export function ActionDrawerTitle(props: { data: { id?: number; action?: AbilityBlock; onSelect?: () => void } }) {
  const id = props.data.id;

  const [_drawer, openDrawer] = useRecoilState(drawerState);

  const { data: _action } = useQuery({
    queryKey: [`find-action-${id}`, { id }],
    queryFn: async ({ queryKey }) => {
      // @ts-ignore
      // eslint-disable-next-line
      const [_key, { id }] = queryKey;
      return await fetchContentById<AbilityBlock>('ability-block', id);
    },
    enabled: !!id,
  });
  const action = props.data.action ?? _action;

  return (
    <>
      {action && (
        <Group justify='space-between' wrap='nowrap'>
          <Group wrap='nowrap' gap={10}>
            <Box>
              <Title order={3}>{toLabel(action.name)}</Title>
            </Box>
            <Box>
              <ActionSymbol cost={action.actions} size={'2.1rem'} />
            </Box>
          </Group>
          {props.data.onSelect ? (
            <Button
              variant='filled'
              radius='xl'
              mb={5}
              size='compact-sm'
              onClick={() => {
                props.data.onSelect?.();
                openDrawer(null);
              }}
            >
              Select
            </Button>
          ) : (
            <Text style={{ textWrap: 'nowrap' }}>{action.type !== 'action' ? toLabel(action.type) : ''}</Text>
          )}
        </Group>
      )}
    </>
  );
}

export function ActionDrawerContent(props: { data: { id?: number; action?: AbilityBlock; showOperations?: boolean } }) {
  const id = props.data.id;

  const { data: _action } = useQuery({
    queryKey: [`find-action-${id}`, { id }],
    queryFn: async ({ queryKey }) => {
      // @ts-ignore
      // eslint-disable-next-line
      const [_key, { id }] = queryKey;
      return await fetchContentById<AbilityBlock>('ability-block', id);
    },
    enabled: !!id,
  });
  const action = props.data.action ?? _action;

  if (!action) {
    return (
      <Loader
        type='bars'
        style={{
          position: 'absolute',
          top: '35%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
        }}
      />
    );
  }

  const hasTopSection =
    (action.prerequisites && action.prerequisites.length > 0) ||
    action.frequency ||
    action.trigger ||
    action.cost ||
    action.requirements ||
    action.access;

  return (
    <Box>
      {action.meta_data?.image_url && (
        <Image
          style={{
            float: 'right',
            maxWidth: 150,
            height: 'auto',
          }}
          ml='sm'
          radius='md'
          fit='contain'
          src={action.meta_data?.image_url}
        />
      )}
      <Box>
        {/* Note: Can't use a Stack here as it breaks the floating image */}
        <Box pb={2}>
          <TraitsDisplay
            traitIds={action.traits ?? []}
            rarity={action.rarity}
            availability={action.availability}
            skill={action.meta_data?.skill}
            interactable
          />
        </Box>
        {action.prerequisites && action.prerequisites.length > 0 && (
          <IndentedText ta='justify'>
            <Text fw={600} c='gray.5' span>
              Prerequisites
            </Text>{' '}
            {action.prerequisites.join(', ')}
          </IndentedText>
        )}
        {action.frequency && (
          <IndentedText ta='justify'>
            <Text fw={600} c='gray.5' span>
              Frequency
            </Text>{' '}
            {action.frequency}
          </IndentedText>
        )}
        {action.trigger && (
          <IndentedText ta='justify'>
            <Text fw={600} c='gray.5' span>
              Trigger
            </Text>{' '}
            {action.trigger}
          </IndentedText>
        )}
        {action.cost && (
          <IndentedText ta='justify'>
            <Text fw={600} c='gray.5' span>
              Cost
            </Text>{' '}
            {action.cost}
          </IndentedText>
        )}
        {action.requirements && (
          <IndentedText ta='justify'>
            <Text fw={600} c='gray.5' span>
              Requirements
            </Text>{' '}
            {action.requirements}
          </IndentedText>
        )}
        {action.access && (
          <IndentedText ta='justify'>
            <Text fw={600} c='gray.5' span>
              Access
            </Text>{' '}
            {action.access}
          </IndentedText>
        )}
        {hasTopSection && <Divider />}
        <RichText ta='justify'>{action.description}</RichText>
        {action.special && (
          <Text ta='justify' style={{ textIndent: TEXT_INDENT_AMOUNT }}>
            <Text fw={600} c='gray.5' span>
              Special
            </Text>{' '}
            <RichText span>{action.special}</RichText>
          </Text>
        )}
      </Box>
      <ShowInjectedText varId='CHARACTER' type='action' id={action.id} />
      <DisplayOperationSelectionOptions operations={action.operations} />
      {props.data.showOperations && <ShowOperationsButton name={action.name} operations={action.operations} />}
    </Box>
  );
}

export function DisplayOperationSelectionOptions(props: { operations?: Operation[] | undefined }) {
  const operations = (props.operations ?? []).filter(
    (op) => op.type === 'select' && ['CUSTOM', 'ABILITY_BLOCK'].includes(op.data.optionType)
  ) as OperationSelect[];
  if (operations.length === 0) return null;

  return (
    <Box>
      <Divider mt={5} />
      <Stack gap='sm'>{operations.map(DisplayOperationSelection)}</Stack>
    </Box>
  );
}

export function DisplayOperationSelection(op: OperationSelect, index: number) {
  const [_drawer, openDrawer] = useRecoilState(drawerState);
  const character = useRecoilValue(characterState);

  const [options, setOptions] = useState([] as OperationSelectOptionCustom[] | ObjectWithUUID[]);
  useEffect(() => {
    // React advises to declare the async function directly inside useEffect
    async function getOptions() {
      if (op.data.modeType === 'PREDEFINED') {
        setOptions((op.data.optionsPredefined ?? []) as OperationSelectOptionCustom[]);
      } else {
        const ops = await determineFilteredSelectionList(
          op.data.optionType,
          op.id,
          (op.data.optionsFilters ?? []) as OperationSelectFilters
        );
        ops.sort(sortObjectByName);
        setOptions(ops);
      }
    }
    getOptions();
  }, [op]);

  const [selectedOption, setSelectedOption] = useState(null as OperationSelectOptionCustom | ObjectWithUUID | null);
  useEffect(() => {
    async function getSelection() {
      setSelectedOption(await getSelectedOption(character, op));
    }
    getSelection();
  });
  const selectedId = instanceOfOperationSelectOptionCustom(selectedOption)
    ? selectedOption.id
    : selectedOption?._select_uuid;
  console.log(selectedOption);

  return (
    <Box key={index} pt={5}>
      <Text fz='md' fw={600}>
        {op.data.title ?? 'Select an Option'}
      </Text>
      <List>
        {options.map((option, index) => (
          <List.Item key={index}>
            <Anchor
              onClick={() => {
                openDrawer({
                  type: instanceOfOperationSelectOptionCustom(option)
                    ? 'generic'
                    : option._content_type === 'ability-block'
                      ? option.type
                      : option._content_type,
                  data: instanceOfOperationSelectOptionCustom(option)
                    ? {
                        title: option.title,
                        description: option.description,
                        operations: option.operations,
                      }
                    : { id: option?.id, action: option },
                  extra: { addToHistory: true },
                });
              }}
            >
              {instanceOfOperationSelectOptionCustom(option) ? option.title : option.name}
            </Anchor>
            {instanceOfOperationSelectOptionCustom(option)
              ? selectedId === option.id
                ? ' (Selected)'
                : ''
              : selectedId === option._select_uuid
                ? ' (Selected)'
                : ''}
          </List.Item>
        ))}
      </List>
    </Box>
  );
}
