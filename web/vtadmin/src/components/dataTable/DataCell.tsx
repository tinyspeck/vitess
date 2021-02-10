import * as React from 'react';

import style from './DataCell.module.scss';

interface Props
    extends React.DetailedHTMLProps<React.TdHTMLAttributes<HTMLTableDataCellElement>, HTMLTableDataCellElement> {}

export const DataCell: React.FunctionComponent<Props> = ({ children, ...props }) => {
    return (
        <td {...props} className={style.cell}>
            {children}
        </td>
    );
};
