import { EmptyState } from '../../components/ui/EmptyState';
import { ErrorState } from '../../components/ui/ErrorState';
import { LoadingState } from '../../components/ui/LoadingState';
import { ServiceCard } from './ServiceCard';
import { ServiceFilters } from './ServiceFilters';
import { useServiceList } from './useServiceList';

export function ServiceListPage() {
  const list = useServiceList();

  return (
    <section>
      <div className="page-head">
        <div>
          <p className="eyebrow">Catalog</p>
          <h1>Book a local service</h1>
          <p className="lede">
            Search the Demo Marketplace catalog, then pick a provider and time that
            fits your address.
          </p>
        </div>
      </div>

      <ServiceFilters
        q={list.q}
        category={list.category}
        categories={list.categories}
        onQueryChange={list.setQuery}
        onCategoryChange={list.setCategory}
      />

      {list.status === 'loading' ? <LoadingState label="Loading services" /> : null}

      {list.status === 'error' ? (
        <ErrorState
          title="Services could not be loaded"
          message={list.error ?? 'Please try again.'}
          onRetry={list.reload}
        />
      ) : null}

      {list.status === 'empty' ? (
        <EmptyState
          title={list.hasFilters ? 'No matching services' : 'No services yet'}
          description={
            list.hasFilters
              ? 'Try another search or clear the category filter.'
              : 'The catalog is empty right now.'
          }
        />
      ) : null}

      {list.status === 'success' ? (
        <div className="grid">
          {list.services.map((service) => (
            <ServiceCard key={service.id} service={service} />
          ))}
        </div>
      ) : null}
    </section>
  );
}
