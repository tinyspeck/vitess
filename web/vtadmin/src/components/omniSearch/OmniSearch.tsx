import * as React from 'react';
import FuzzySearch from 'fuzzy-search'; // Or: var FuzzySearch = require('fuzzy-search');

import style from './OmniSearch.module.scss';
import { Icons } from '../Icon';
import { TextInput } from '../TextInput';
import { useTablets } from '../../hooks/api';
import { Link } from 'react-router-dom';

export const OmniSearch = () => {
    const { data: tablets, error, isError, isSuccess } = useTablets();

    const [searchText, setSearchText] = React.useState<string>('');
    const [showPopover, setShowPopover] = React.useState<boolean>(false);

    const refContainer: any = React.useRef(null);
    const refInput: any = React.useRef(null);

    const onFocus = () => {
        setShowPopover(true);
    };

    const onChangeText = (event: any) => {
        setSearchText(event.target.value);
    };

    React.useEffect(() => {
        const handleClickOutside = (event: any) => {
            if (refContainer.current && !refContainer.current.contains(event.target)) {
                setShowPopover(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [refContainer]);

    React.useEffect(() => {
        const handleKeyPress = (event: any) => {
            const hasFocus = refContainer.current && refContainer.current.contains(event.target);
            if (hasFocus) {
                switch (event.key) {
                    case 'Escape':
                        event.preventDefault();
                        refInput.current.blur();
                        setShowPopover(false);
                        break;
                }
            } else {
                switch (event.key) {
                    case 'Escape':
                        setSearchText('');
                        break;
                    case '/':
                        event.preventDefault();
                        refInput.current.focus();
                        break;
                }
            }
        };

        document.addEventListener('keydown', handleKeyPress);
        return () => {
            document.removeEventListener('keydown', handleKeyPress);
        };
    });

    const searcher = new FuzzySearch(tablets || [], ['tablet.hostname', 'tablet.alias.cell', 'tablet.alias.uid']);
    const results = searcher.search(searchText);

    return (
        <div className={style.container} ref={refContainer}>
            <TextInput
                className={style.input}
                iconLeft={Icons.search}
                onChange={onChangeText}
                onFocus={onFocus}
                placeholder="[ / ] to quick search"
                ref={refInput}
                size="large"
                value={searchText || ''}
            />
            {showPopover && (
                <div className={style.popover}>
                    <p>Tablets</p>
                    <ol className={style.list}>
                        {results.map((tablet, tdx) => (
                            <li key={tdx}>
                                <Link
                                    onClick={() => setShowPopover(false)}
                                    to={`/${tablet.cluster?.id}/tablet/${tablet.tablet?.alias?.cell}-${tablet.tablet?.alias?.uid}`}
                                >
                                    <code>
                                        [ {tdx} ] {tablet.tablet?.alias?.cell}-{tablet.tablet?.alias?.uid} (
                                        {tablet.tablet?.hostname})
                                    </code>
                                </Link>
                            </li>
                        ))}
                    </ol>
                    <Link to="/search">See all results</Link>
                </div>
            )}
        </div>
    );
};
