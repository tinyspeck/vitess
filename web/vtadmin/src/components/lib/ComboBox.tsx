import React, { useState } from 'react';
import { useCombobox } from 'downshift';

import style from './ComboBox.module.scss';
import { TextInput } from '../TextInput';
import { Icons } from '../Icon';

interface Props {
    items?: string[];
    placeholder?: string;
}

export const ComboBox = ({ items = [], placeholder }: Props) => {
    const [inputItems, setInputItems] = useState(items);
    const [selectedItems, setSelectedItems] = useState<any[]>([]);
    const {
        isOpen,
        getToggleButtonProps,
        getLabelProps,
        getMenuProps,
        getInputProps,
        getComboboxProps,
        highlightedIndex,
        getItemProps,
    } = useCombobox({
        items: inputItems,
        onSelectedItemChange: ({ selectedItem }: any) => {
            if (!selectedItem) {
                return;
            }
            const index = selectedItems.indexOf(selectedItem);
            if (index > 0) {
                setSelectedItems([...selectedItems.slice(0, index), ...selectedItems.slice(index + 1)]);
            } else if (index === 0) {
                setSelectedItems([...selectedItems.slice(1)]);
            } else {
                setSelectedItems([...selectedItems, selectedItem]);
            }
        },
        selectedItem: null,
        stateReducer: (state, actionAndChanges) => {
            const { changes, type } = actionAndChanges;
            switch (type) {
                case useCombobox.stateChangeTypes.InputKeyDownEnter:
                case useCombobox.stateChangeTypes.ItemClick:
                    return {
                        ...changes,
                        isOpen: true, // keep menu open after selection.
                        highlightedIndex: state.highlightedIndex,
                        inputValue: '', // don't add the item string as input value at selection.
                    };
                case useCombobox.stateChangeTypes.InputBlur:
                    return {
                        ...changes,
                        inputValue: '', // don't add the item string as input value at selection.
                    };
                default:
                    return changes;
            }
        },
        onInputValueChange: ({ inputValue }) => {
            setInputItems(items.filter((item) => item.toLowerCase().startsWith((inputValue || '').toLowerCase())));
        },
    });

    return (
        <div className={style.container}>
            <div className={style.comboBox} {...getComboboxProps()}>
                <TextInput
                    {...getInputProps()}
                    onClick={getToggleButtonProps().onClick}
                    className={style.input}
                    iconRight={Icons.dropDown}
                    placeholder={placeholder}
                />
            </div>
            {isOpen && (
                <div className={style.dropdown}>
                    <ul {...getMenuProps()} style={{}}>
                        {inputItems.map((item, index) => (
                            <li
                                style={highlightedIndex === index ? { backgroundColor: '#bde4ff' } : {}}
                                key={`${item}${index}`}
                                {...getItemProps({
                                    item,
                                    index,
                                })}
                            >
                                <input
                                    type="checkbox"
                                    checked={selectedItems.includes(item)}
                                    value={item}
                                    onChange={() => null}
                                />
                                <span />
                                {item}
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};
