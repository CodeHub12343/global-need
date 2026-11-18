'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import styled from 'styled-components';
import { Search, Heart, SlidersHorizontal, X } from 'lucide-react';
import { Container } from '@/components/ui/Container';
import { H1, Lead, Eyebrow } from '@/components/ui/Typography';
import { EmptyState } from '@/components/ui/EmptyState';
import { CauseCard } from '@/components/causes/CauseCard';
import { CATEGORIES } from '@/lib/mock-data';
import { publicApi, type PublicCause } from '@/lib/public-api';

const Head = styled.section`
  padding: 56px 0 36px;
  background:
    linear-gradient(90deg, #fff 0%, rgba(255,255,255,.96) 45%, rgba(255,255,255,.65) 70%, rgba(255,255,255,.35) 100%),
    url('/landing/classroom.jpg') right center/cover no-repeat;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  @media (max-width: ${({ theme }) => theme.breakpoints.lg}) {
    padding: 28px 0 24px;
    background:
      linear-gradient(180deg, rgba(255,255,255,0.97) 0%, rgba(255,255,255,0.94) 55%, rgba(255,255,255,0.88) 100%),
      linear-gradient(180deg, rgba(15,118,110,0.12), rgba(15,118,110,0.04)),
      url('/landing/classroom.jpg') center/cover no-repeat;
  }
`;
const Crumbs = styled.div`
  font-size: 13px;
  color: ${({ theme }) => theme.colors.muted};
  margin-bottom: 12px;
  a { color: ${({ theme }) => theme.colors.muted}; }
`;
const SearchRow = styled.form`
  margin-top: 28px;
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 12px;
  max-width: 760px;
  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) {
    margin-top: 20px;
    gap: 8px;
  }
`;
const SearchWrap = styled.div`
  position: relative;
  input { width: 100%; padding: 14px 16px 14px 46px; border-radius: 12px; border: 1px solid ${({ theme }) => theme.colors.borderStrong}; background: #fff; font-size: 15px; font-family: inherit; }
  svg { position: absolute; left: 16px; top: 50%; transform: translateY(-50%); color: ${({ theme }) => theme.colors.muted}; }
  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) {
    input { padding: 12px 14px 12px 40px; font-size: 14px; border-radius: 10px; }
    svg { left: 13px; }
  }
`;
const SearchBtn = styled.button`
  padding: 0 22px;
  height: 48px;
  border-radius: 12px;
  background: ${({ theme }) => theme.colors.primary};
  color: #fff;
  border: 0;
  font-weight: 600;
  font-family: inherit;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  &:hover { background: ${({ theme }) => theme.colors.primary800}; }
  .lbl-md { display: inline; }
  .lbl-sm { display: none; }
  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) {
    height: 44px;
    padding: 0 14px;
    border-radius: 10px;
    .lbl-md { display: none; }
    .lbl-sm { display: inline-flex; }
  }
`;
const FilterToggleBar = styled.div`
  display: none;
  @media (max-width: ${({ theme }) => theme.breakpoints.lg}) {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
    margin-bottom: 14px;
  }
  button {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 10px 14px;
    border-radius: 10px;
    border: 1px solid ${({ theme }) => theme.colors.border};
    background: #fff;
    font-family: inherit;
    font-size: 13.5px;
    font-weight: 600;
    color: ${({ theme }) => theme.colors.ink};
    cursor: pointer;
  }
  .count {
    display: inline-grid;
    place-items: center;
    min-width: 20px;
    height: 20px;
    padding: 0 6px;
    border-radius: 999px;
    background: ${({ theme }) => theme.colors.primary};
    color: #fff;
    font-size: 11px;
    font-weight: 700;
  }
  .clear {
    background: transparent;
    border: 0;
    color: ${({ theme }) => theme.colors.muted};
    padding: 8px 4px;
    font-size: 13px;
    cursor: pointer;
    &:hover { color: ${({ theme }) => theme.colors.primary}; }
  }
`;
const Layout = styled.div`
  display: grid;
  grid-template-columns: 260px 1fr;
  gap: 32px;
  align-items: flex-start;
  padding: 32px 0 64px;
  @media (max-width: ${({ theme }) => theme.breakpoints.lg}) { grid-template-columns: 1fr; }
`;
const Filters = styled.aside<{ $openOnMobile?: boolean }>`
  background: #fff;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 14px;
  padding: 22px;
  position: sticky;
  top: 96px;
  @media (max-width: ${({ theme }) => theme.breakpoints.lg}) {
    position: static;
    padding: 16px;
    display: ${({ $openOnMobile }) => ($openOnMobile ? 'block' : 'none')};
    margin-bottom: 16px;
  }
  h3 { font-family: ${({ theme }) => theme.fonts.serif}; font-size: 16px; font-weight: 600; color: ${({ theme }) => theme.colors.ink}; margin: 0 0 12px; }
  .group { padding: 14px 0; border-bottom: 1px solid ${({ theme }) => theme.colors.border}; &:last-child { border-bottom: none; }
    .l { font-size: 11px; font-weight: 700; color: ${({ theme }) => theme.colors.muted}; letter-spacing: 0.08em; text-transform: uppercase; margin-bottom: 10px; }
    label { display: flex; align-items: center; gap: 10px; padding: 5px 0; font-size: 14px; color: ${({ theme }) => theme.colors.text}; cursor: pointer; input { accent-color: ${({ theme }) => theme.colors.primary}; } }
  }
`;
const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
  @media (max-width: ${({ theme }) => theme.breakpoints.lg}) { grid-template-columns: repeat(2, 1fr); }
  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) { grid-template-columns: repeat(2, 1fr); gap: 12px; }
`;
const ResultsBar = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
  flex-wrap: wrap;
  gap: 12px;
  .c { font-size: 14px; color: ${({ theme }) => theme.colors.muted}; strong { color: ${({ theme }) => theme.colors.ink}; font-weight: 600; } }
`;
const Pager = styled.div`
  display: flex;
  justify-content: center;
  gap: 8px;
  margin-top: 28px;
  button { padding: 8px 14px; border-radius: 8px; border: 1px solid ${({ theme }) => theme.colors.border}; background: #fff; font-family: inherit; font-size: 13px; cursor: pointer; }
  button[disabled] { opacity: 0.5; cursor: not-allowed; }
  span { padding: 8px 10px; font-size: 13px; color: ${({ theme }) => theme.colors.muted}; }
`;

type Period = 'any' | '7d' | '30d';

export default function CausesPage() {
  const initialCategory = typeof window !== 'undefined'
    ? new URLSearchParams(window.location.search).get('category') || ''
    : '';

  const [q, setQ] = useState('');
  const [queryText, setQueryText] = useState('');
  const [selectedCats, setSelectedCats] = useState<string[]>(initialCategory ? [initialCategory] : []);
  const [verifiedOnly, setVerifiedOnly] = useState(true);
  const [hasUpdates, setHasUpdates] = useState(false);
  const [period, setPeriod] = useState<Period>('any');
  const [page, setPage] = useState(1);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [state, setState] = useState<{ loading: boolean; items: PublicCause[]; total: number; totalPages: number; error?: string }>({
    loading: true,
    items: [],
    total: 0,
    totalPages: 1,
  });

  useEffect(() => {
    let cancelled = false;
    setState((s) => ({ ...s, loading: true, error: undefined }));
    publicApi
      .listCauses({
        q,
        category: selectedCats.join(','),
        verified: verifiedOnly,
        hasUpdates,
        period,
        page,
        limit: 12,
      })
      .then((data) => {
        if (cancelled) return;
        setState({ loading: false, items: data.items, total: data.total, totalPages: data.totalPages });
      })
      .catch((err) => {
        if (cancelled) return;
        setState({ loading: false, items: [], total: 0, totalPages: 1, error: err.message });
      });
    return () => { cancelled = true; };
  }, [q, selectedCats, verifiedOnly, hasUpdates, period, page]);

  const toggleCat = (slug: string) => {
    setPage(1);
    setSelectedCats((cur) => (cur.includes(slug) ? cur.filter((s) => s !== slug) : [...cur, slug]));
  };

  const onSubmitSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setQ(queryText.trim());
    setPage(1);
  };

  const summary = useMemo(() => {
    if (state.loading) return 'Loading…';
    if (state.error) return state.error;
    return `${state.total} cause${state.total === 1 ? '' : 's'}`;
  }, [state]);

  return (
    <>
      <Head>
        <Container>
          <Crumbs>
            <Link href="/">Home</Link> › <span>Causes</span>
          </Crumbs>
          <Eyebrow>Browse</Eyebrow>
          <H1 style={{ marginTop: 10, marginBottom: 12 }}>Browse humanitarian causes</H1>
          <Lead>
            Explore independently reviewed causes submitted by approved organizations. Use the
            filters to focus on categories, regions, or verification status that matter to you.
          </Lead>
          <SearchRow onSubmit={onSubmitSearch}>
            <SearchWrap>
              <Search size={18} />
              <input
                type="search"
                placeholder="Search by cause, organization or region…"
                value={queryText}
                onChange={(e) => setQueryText(e.target.value)}
              />
            </SearchWrap>
            <SearchBtn type="submit" aria-label="Search">
              <Search size={18} />
              <span className="lbl-md">Search</span>
            </SearchBtn>
          </SearchRow>
        </Container>
      </Head>
      <Container>
        {(() => {
          const activeFilterCount = (q ? 1 : 0) + selectedCats.length + (hasUpdates ? 1 : 0) + (period !== 'any' ? 1 : 0) + (verifiedOnly ? 0 : 1);
          const clearAll = () => {
            setQ(''); setQueryText(''); setSelectedCats([]); setHasUpdates(false); setPeriod('any'); setVerifiedOnly(true); setPage(1);
          };
          return (
            <FilterToggleBar>
              <button type="button" onClick={() => setFiltersOpen((o) => !o)} aria-expanded={filtersOpen}>
                {filtersOpen ? <X size={16} /> : <SlidersHorizontal size={16} />}
                {filtersOpen ? 'Hide filters' : 'Filters'}
                {activeFilterCount > 0 && <span className="count">{activeFilterCount}</span>}
              </button>
              {activeFilterCount > 0 && (
                <button type="button" className="clear" onClick={clearAll}>Clear all</button>
              )}
            </FilterToggleBar>
          );
        })()}
        <Layout>
          <Filters $openOnMobile={filtersOpen}>
            <h3>Filters</h3>
            <div className="group">
              <div className="l">Category</div>
              {CATEGORIES.map((c) => (
                <label key={c.slug}>
                  <input
                    type="checkbox"
                    checked={selectedCats.includes(c.slug)}
                    onChange={() => toggleCat(c.slug)}
                  />
                  {c.name}
                </label>
              ))}
            </div>
            <div className="group">
              <div className="l">Verification</div>
              <label>
                <input type="checkbox" checked={verifiedOnly} onChange={(e) => { setPage(1); setVerifiedOnly(e.target.checked); }} />
                Independently reviewed
              </label>
              <label>
                <input type="checkbox" checked={hasUpdates} onChange={(e) => { setPage(1); setHasUpdates(e.target.checked); }} />
                Has recent updates
              </label>
            </div>
            <div className="group">
              <div className="l">Last updated</div>
              <label><input type="radio" name="when" checked={period === 'any'} onChange={() => { setPage(1); setPeriod('any'); }} /> Any time</label>
              <label><input type="radio" name="when" checked={period === '7d'} onChange={() => { setPage(1); setPeriod('7d'); }} /> Past 7 days</label>
              <label><input type="radio" name="when" checked={period === '30d'} onChange={() => { setPage(1); setPeriod('30d'); }} /> Past 30 days</label>
            </div>
          </Filters>

          <div>
            <ResultsBar>
              <div className="c"><strong>{summary}</strong></div>
            </ResultsBar>
            {state.loading && state.items.length === 0 ? (
              <div style={{ padding: 40, textAlign: 'center', color: '#64748B' }}>Loading causes…</div>
            ) : state.items.length === 0 ? (
              (() => {
                // verifiedOnly defaults to true, so it only counts as "active" when turned off
                const filtersActive = !!q || selectedCats.length > 0 || hasUpdates || period !== 'any';
                const resetFilters = () => {
                  setQ(''); setQueryText(''); setSelectedCats([]); setHasUpdates(false); setPeriod('any'); setVerifiedOnly(true); setPage(1);
                };
                return filtersActive ? (
                  <EmptyState
                    icon={<Search size={26} />}
                    title="No causes match these filters"
                    body="Try removing a filter or broadening your search to see more causes."
                    onSecondary={resetFilters}
                    secondaryLabel="Reset filters"
                  />
                ) : (
                  <EmptyState
                    icon={<Heart size={26} />}
                    title="Our first causes are on the way"
                    body="We're onboarding our founding partner organizations and verifying their work. Approved causes will appear here as they're published. If you run a humanitarian organization, submit yours to be among the first."
                    primaryHref="/register?role=org"
                    primaryLabel="Submit your organization"
                  />
                );
              })()
            ) : (
              <Grid>
                {state.items.map((c) => (
                  <CauseCard key={c.id} cause={{
                    slug: c.slug,
                    gradient: c.gradient,
                    title: c.title,
                    category: c.category as any,
                    shortDescription: c.shortDescription,
                    organization: {
                      name: c.organization?.name || 'Organization',
                      verified: !!c.organization?.verified,
                    } as any,
                  } as any} />
                ))}
              </Grid>
            )}
            {state.totalPages > 1 && (
              <Pager>
                <button disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>← Previous</button>
                <span>Page {page} of {state.totalPages}</span>
                <button disabled={page >= state.totalPages} onClick={() => setPage((p) => p + 1)}>Next →</button>
              </Pager>
            )}
          </div>
        </Layout>
      </Container>
    </>
  );
}
