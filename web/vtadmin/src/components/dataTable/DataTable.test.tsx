import * as React from 'react';
import qs from 'query-string';
import { render, screen, within } from '@testing-library/react';

import { DataTable } from './DataTable';
import { MemoryRouter, Route } from 'react-router-dom';

const _render = (children: any, params?: any) => {
    const qp = qs.stringify(params);
    return render(
        <MemoryRouter initialEntries={[`/items?${qp}`]}>
            <Route path="/items">{children}</Route>
        </MemoryRouter>
    );
};

describe('DataTable', () => {
    describe('pagination', () => {
        it('renders pagination nav links', () => {
            const data = [{ text: 'one' }, { text: 'two' }, { text: 'three' }];
            _render(
                <DataTable
                    columns={['Text']}
                    data={data}
                    renderRows={(rows) =>
                        rows.map((row, idx) => (
                            <tr key={idx}>
                                <td>{row.text}</td>
                            </tr>
                        ))
                    }
                    rowsPerPage={2}
                />
            );

            const pageNav = screen.getByRole('navigation', { name: 'pagination navigation' });

            const pageHint = within(pageNav).getByText('Showing', { exact: false });
            expect(pageHint).toHaveTextContent('Showing 1 - 2 of 3');

            const pageLinks = within(pageNav).getAllByRole('link');
            expect(pageLinks).toHaveLength(2);

            expect(pageLinks[0]).toHaveClass('activePageLink');
            expect(pageLinks[0]).toHaveAttribute('href', '/items?page=1');
            expect(pageLinks[0]).toHaveTextContent('1');

            expect(pageLinks[1]).not.toHaveClass('activePageLink');
            expect(pageLinks[1]).toHaveAttribute('href', '/items?page=2');
            expect(pageLinks[1]).toHaveTextContent('2');
        });

        it('does not render pagination if there is only one page', () => {
            const data = [{ text: 'one' }, { text: 'two' }, { text: 'three' }];
            _render(
                <DataTable
                    columns={['Text']}
                    data={data}
                    renderRows={(rows) =>
                        rows.map((row, idx) => (
                            <tr key={idx}>
                                <td>{row.text}</td>
                            </tr>
                        ))
                    }
                    rowsPerPage={3}
                />
            );

            const pageNav = screen.getByRole('navigation', { name: 'pagination navigation' });

            const pageHint = within(pageNav).getByText('Showing', { exact: false });
            expect(pageHint).toHaveTextContent('Showing 1 - 3 of 3');

            const pageLinks = within(pageNav).queryAllByRole('link');
            expect(pageLinks).toHaveLength(0);
        });

        it('limits the number of visible pagination nav links', async () => {
            const data = [
                { text: 'one' },
                { text: 'two' },
                { text: 'three' },
                { text: 'four' },
                { text: 'five' },
                { text: 'six' },
                { text: 'seven' },
                { text: 'eight' },
                { text: 'nine' },
                { text: 'ten' },
                { text: 'eleven' },
            ];

            _render(
                <DataTable
                    columns={['Text']}
                    data={data}
                    pageNavLength={4}
                    renderRows={(rows) =>
                        rows.map((row, idx) => (
                            <tr key={idx}>
                                <td>{row.text}</td>
                            </tr>
                        ))
                    }
                    rowsPerPage={2}
                />
            );

            const pageNav = screen.getByRole('navigation', { name: 'pagination navigation' });

            const pageHint = within(pageNav).getByText('Showing', { exact: false });
            expect(pageHint).toHaveTextContent('Showing 1 - 2 of 11');

            const pageLinks = within(pageNav).getAllByRole('link');
            expect(pageLinks).toHaveLength(3);

            expect(pageLinks[0]).toHaveClass('activePageLink');
            expect(pageLinks[0]).toHaveAttribute('href', '/items?page=1');
            expect(pageLinks[0]).toHaveTextContent('1');

            expect(pageLinks[1]).not.toHaveClass('activePageLink');
            expect(pageLinks[1]).toHaveAttribute('href', '/items?page=2');
            expect(pageLinks[1]).toHaveTextContent('2');

            expect(pageLinks[2]).not.toHaveClass('activePageLink');
            expect(pageLinks[2]).toHaveAttribute('href', '/items?page=6');
            expect(pageLinks[2]).toHaveTextContent('6');
        });
    });
});
