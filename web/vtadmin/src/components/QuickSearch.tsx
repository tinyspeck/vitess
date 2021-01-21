import * as React from 'react';

import style from './QuickSearch.module.scss';

export const QuickSearch = () => {
    return (
        <div className={style.container}>
            <div className={style.inputContainer}>
                <input className={style.input} placeholder="Quick find" type="text" />
                <svg width="24" height="24" viewBox="0 0 24 24" fill="#718096" xmlns="http://www.w3.org/2000/svg">
                    <path d="M15.5 14H14.71L14.43 13.73C15.41 12.59 16 11.11 16 9.5C16 5.91 13.09 3 9.5 3C5.91 3 3 5.91 3 9.5C3 13.09 5.91 16 9.5 16C11.11 16 12.59 15.41 13.73 14.43L14 14.71V15.5L19 20.49L20.49 19L15.5 14ZM9.5 14C7.01 14 5 11.99 5 9.5C5 7.01 7.01 5 9.5 5C11.99 5 14 7.01 14 9.5C14 11.99 11.99 14 9.5 14Z" />
                </svg>
            </div>
            <button className={style.button}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <g clip-path="url(#clip0)">
                        <path
                            d="M4.77382 10.4401L8.04722 13.7135L6.72871 15.032L3.45532 11.7586C1.16746 9.47076 1.16746 5.75692 3.45532 3.46906C5.74318 1.1812 9.45702 1.1812 11.7449 3.46906L15.0183 6.74246L13.6998 8.06096L10.4264 4.78756C8.87144 3.23262 6.32876 3.23262 4.77382 4.78756C3.21888 6.3425 3.21888 8.88518 4.77382 10.4401Z"
                            fill="#718096"
                        />
                        <path
                            d="M9.34286 8.0381L15.8897 14.5849L14.5712 15.9034L8.02436 9.3566L9.34286 8.0381Z"
                            fill="#718096"
                        />
                        <path
                            d="M19.1402 13.5014L15.8668 10.228L17.1853 8.90949L20.4587 12.1829C22.7466 14.4707 22.7466 18.1846 20.4587 20.4724C18.1708 22.7603 14.457 22.7603 12.1691 20.4724L8.89574 17.199L10.2142 15.8805L13.4876 19.1539C15.0426 20.7089 17.5853 20.7089 19.1402 19.1539C20.6951 17.599 20.6951 15.0563 19.1402 13.5014Z"
                            fill="#718096"
                        />
                    </g>
                    <defs>
                        <clipPath id="clip0">
                            <rect width="24" height="24" fill="white" />
                        </clipPath>
                    </defs>
                </svg>
            </button>
        </div>
    );
};
