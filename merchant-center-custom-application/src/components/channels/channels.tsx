import { useIntl } from 'react-intl';
import {
  Link as RouterLink,
  Switch,
  useHistory,
  useRouteMatch,
} from 'react-router-dom';
import {
  usePaginationState,
  useDataTableSortingState,
} from '@commercetools-uikit/hooks';
import { BackIcon } from '@commercetools-uikit/icons';
import Constraints from '@commercetools-uikit/constraints';
import FlatButton from '@commercetools-uikit/flat-button';
import LoadingSpinner from '@commercetools-uikit/loading-spinner';
import DataTable from '@commercetools-uikit/data-table';
import { ContentNotification } from '@commercetools-uikit/notifications';
import { Pagination } from '@commercetools-uikit/pagination';
import Spacings from '@commercetools-uikit/spacings';
import Text from '@commercetools-uikit/text';
import { SuspendedRoute } from '@commercetools-frontend/application-shell';
import type { TFetchProductsQuery } from '../../types/generated/ctp';
import { useChannelsFetcher } from '../../hooks/use-channels-connector';
import { getErrorMessage } from '../../helpers';
import messages from './messages';
import ChannelDetails from '../channel-details';

const columns = [
  { key: 'key', label: 'Product key', isSortable: true },
  { key: 'skus', label: 'skus'},
  { key: 'price', label: 'Price'},
];

type TChannelsProps = {
  linkToWelcome: string;
};

const Channels = (props: TChannelsProps) => {
  const intl = useIntl();
  const match = useRouteMatch();
  const { push } = useHistory();
  const { page, perPage } = usePaginationState();
  const tableSorting = useDataTableSortingState({ key: 'key', order: 'asc' });
  const { channelsPaginatedResult, error, loading } = useChannelsFetcher({
    page,
    perPage,
    tableSorting,
  });

  if (error) {
    return (
      <ContentNotification type="error">
        <Text.Body>{getErrorMessage(error)}</Text.Body>
      </ContentNotification>
    );
  }

  return (
    <Spacings.Stack scale="xl">
      <Spacings.Stack scale="xs">
        <FlatButton
          as={RouterLink}
          to={props.linkToWelcome}
          label={intl.formatMessage(messages.backToWelcome)}
          icon={<BackIcon />}
        />
        <Text.Headline as="h2" intlMessage={messages.title} />
      </Spacings.Stack>

      <Constraints.Horizontal max={13}>
        <ContentNotification type="info">
          <Text.Body intlMessage={messages.demoHint} />
        </ContentNotification>
      </Constraints.Horizontal>

      {loading && <LoadingSpinner />}

      {channelsPaginatedResult ? (
        <Spacings.Stack scale="l">
          <DataTable<NonNullable<TFetchProductsQuery['products']['results']>[0]>
            isCondensed
            columns={columns}
            rows={channelsPaginatedResult.results}
            itemRenderer={(item, column) => {
              switch (column.key) {
                case 'key':
                  return item.key;
                case 'skus':
                  return item.skus.join(', ');
                  case 'price':
      const price = item.masterData.current.masterVariant.prices?.[0]?.value;
      if (!price) {
        console.warn('Price data missing for item:', item);
        return 'No Price';
      }
      return `${price.currencyCode} ${(price.centAmount / 100).toFixed(2)}`;
    default:
      return null;
              }
            }}
            sortedBy={tableSorting.value.key}
            sortDirection={tableSorting.value.order}
            onSortChange={tableSorting.onChange}
            onRowClick={(row) => push(`${match.url}/${row.id}`)}
          />
          <Pagination
            page={page.value}
            onPageChange={page.onChange}
            perPage={perPage.value}
            onPerPageChange={perPage.onChange}
            totalItems={channelsPaginatedResult.total}
          />
          <Switch>
            <SuspendedRoute path={`${match.url}/:id`}>
              <ChannelDetails onClose={() => push(`${match.url}`)} />
            </SuspendedRoute>
          </Switch>
        </Spacings.Stack>
      ) : null}
    </Spacings.Stack>
  );
};
Channels.displayName = 'Products';

export default Channels;
