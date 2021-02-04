import * as React from 'react';
import { Theme, useTheme } from '../../hooks/useTheme';
import { Button } from '../Button';
import { Icon, Icons } from '../Icon';
import { Modal } from '../lib/Modal';
import { TextInput } from '../TextInput';
import style from './Debug.module.scss';

export const Debug = () => {
    const [theme, setTheme] = useTheme();

    return (
        <div>
            <h1>Debugging ✨🦋🐛🐝🐞🐜🕷🕸🦂🦗🦟✨</h1>

            <h2>Environment variables</h2>
            <pre>{JSON.stringify(process.env, null, 2)}</pre>

            <h2>Style Guide</h2>

            <h3>Theme</h3>
            <div>
                {Object.values(Theme).map((t) => (
                    <div key={t}>
                        <label>
                            <input
                                checked={theme === t}
                                name="theme"
                                onChange={() => setTheme(t)}
                                type="radio"
                                value={t}
                            />
                            {t}
                        </label>
                    </div>
                ))}
            </div>

            <h3>Modal</h3>
            <div className={style.modalContainer}>
                <Modal title="Example modal">
                    <p>
                        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Fusce et orci magna. Suspendisse sit
                        amet fringilla mi, in congue justo. Quisque rhoncus urna vel risus pulvinar, eget pretium ante
                        feugiat. Ut pretium est et lacus accumsan dictum. Ut ac turpis vel tortor vestibulum ullamcorper
                        id non enim. Praesent ut metus faucibus, finibus dolor vitae, laoreet quam. Etiam venenatis ac
                        sapien quis tincidunt. Maecenas pretium tellus eget tortor ullamcorper rhoncus. Donec tempus
                        luctus leo eget pretium. Vestibulum fringilla fringilla odio, nec varius libero laoreet nec. Nam
                        nec tempus enim. Aenean tincidunt felis at mauris molestie, non faucibus magna imperdiet. Nullam
                        dictum diam orci, ut accumsan libero pretium id. Donec sodales ut odio sed elementum.
                    </p>
                    <p>
                        Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos. Duis
                        iaculis orci rutrum, faucibus ipsum a, finibus felis. Pellentesque tempus non lectus porttitor
                        malesuada. Nulla facilisi. Morbi consequat elit ut dictum congue. Donec et elementum lacus, id
                        ornare dui. Nullam convallis metus eget efficitur consequat. Praesent ut urna eros. Curabitur
                        porta sapien at ante commodo, vel euismod lacus blandit. Ut tempus, nulla ac eleifend finibus,
                        lacus metus vestibulum erat, ultricies placerat enim elit in mi. Curabitur a suscipit lacus, sed
                        porta lacus. Nunc scelerisque, justo suscipit malesuada efficitur, purus libero molestie tellus,
                        ut convallis risus nisl sed odio. Morbi imperdiet ipsum eget porttitor posuere. Duis lacinia,
                        mauris sed fermentum semper, est ligula semper nibh, eget bibendum turpis erat at ex. Mauris
                        ornare dolor blandit lorem gravida eleifend.
                    </p>
                    <p>
                        Pellentesque a risus in magna egestas dictum. Quisque condimentum mauris mi, eu viverra dolor
                        venenatis vitae. Nunc faucibus neque a eros porttitor ullamcorper. Vivamus vel eros sapien.
                        Vestibulum auctor, lorem in semper vulputate, leo ante volutpat quam, luctus pellentesque nisi
                        mi et enim. Suspendisse venenatis libero eleifend euismod consequat. Maecenas lacus lectus,
                        euismod lacinia justo id, tempus iaculis sem. Donec posuere, leo non efficitur aliquam, enim
                        turpis hendrerit nisl, id iaculis ligula enim vel velit. Aenean orci sem, posuere at mauris sed,
                        vestibulum pellentesque nulla. In id tortor condimentum, accumsan lectus ut, euismod erat.
                        Integer mattis in eros eu dignissim. Donec ac pulvinar ligula, vitae interdum dolor. Donec
                        mattis libero justo, et posuere nisi congue sollicitudin.
                    </p>
                    <p>
                        Integer malesuada nec sem sit amet dapibus. Donec eget sapien ut ex volutpat vestibulum.
                        Praesent id nunc velit. Nam in metus tincidunt, semper nulla at, laoreet risus. Suspendisse quis
                        erat eu lorem lacinia aliquam. Sed elementum lorem et nibh eleifend aliquam eget vel nisi.
                        Integer dolor metus, varius in efficitur at, ultrices sed mi. Phasellus eu efficitur massa, eget
                        cursus magna. Ut non hendrerit purus. Aenean sollicitudin mauris a nisl pharetra auctor. Aenean
                        laoreet varius lacus, a maximus nisl ultrices ac. Donec nec libero venenatis, malesuada ex ac,
                        dapibus tortor. Curabitur quis purus vitae nunc pulvinar mattis commodo sed nisl. Pellentesque
                        suscipit tristique sapien et consectetur.
                    </p>
                    <p>
                        Donec at tincidunt dui. In ultrices, arcu a lobortis blandit, lectus nunc porttitor urna, non
                        pulvinar felis tortor sed urna. Phasellus fermentum, lectus ac rutrum porttitor, erat justo
                        bibendum diam, nec tincidunt augue quam sagittis sapien. Nam luctus dignissim nisi ac feugiat.
                        Suspendisse id risus est. Donec volutpat posuere odio, tincidunt condimentum lorem ornare id.
                        Curabitur urna nisl, elementum non leo vitae, ornare rutrum tellus. Cras tincidunt sem sit amet
                        rutrum venenatis. Maecenas vel consequat elit. Nunc suscipit luctus lacus, ut pretium nisi
                        venenatis et. Proin dapibus interdum suscipit. Fusce euismod, lectus sed tristique ullamcorper,
                        dui tortor ornare mauris, id commodo nunc orci sit amet nibh. Vestibulum turpis eros, fringilla
                        ut consequat at, suscipit vitae nulla.
                    </p>
                </Modal>
            </div>

            <h3>Icons</h3>
            <div className={style.iconContainer}>
                {Object.values(Icons).map((i) => (
                    <Icon className={style.icon} icon={i} key={i} />
                ))}
            </div>

            <h3>Text Inputs</h3>
            <div className={style.inputContainer}>
                <TextInput autoFocus placeholder="Basic text input" />
                <TextInput iconLeft={Icons.search} placeholder="With leftIcon" />
                <TextInput iconRight={Icons.delete} placeholder="With rightIcon" />
                <TextInput iconLeft={Icons.search} iconRight={Icons.delete} placeholder="With leftIcon and rightIcon" />
                <TextInput disabled placeholder="Disabled" />
                <TextInput
                    disabled
                    iconLeft={Icons.search}
                    iconRight={Icons.delete}
                    placeholder="Disabled with icons"
                />
                <div className={style.inputRow}>
                    <TextInput
                        iconLeft={Icons.search}
                        iconRight={Icons.delete}
                        size="large"
                        placeholder="Button-adjacent"
                    />
                    <Button size="large">Primary</Button>
                    <Button secondary size="large">
                        Secondary
                    </Button>
                </div>
                <div className={style.inputRow}>
                    <TextInput iconLeft={Icons.search} iconRight={Icons.delete} placeholder="Button-adjacent" />
                    <Button>Primary</Button>
                    <Button secondary>Secondary</Button>
                </div>
            </div>

            <h3>Buttons</h3>
            <div className={style.buttonContainer}>
                {/* Large */}
                <Button size="large">Button</Button>
                <Button secondary size="large">
                    Button
                </Button>
                <Button icon={Icons.circleAdd} size="large">
                    Button
                </Button>
                <Button icon={Icons.circleAdd} secondary size="large">
                    Button
                </Button>
                <Button disabled size="large">
                    Button
                </Button>
                <Button disabled secondary size="large">
                    Button
                </Button>
                <Button disabled icon={Icons.circleAdd} size="large">
                    Button
                </Button>
                <Button disabled icon={Icons.circleAdd} secondary size="large">
                    Button
                </Button>

                {/* Medium */}
                <Button size="medium">Button</Button>
                <Button secondary size="medium">
                    Button
                </Button>
                <Button icon={Icons.circleAdd} size="medium">
                    Button
                </Button>
                <Button icon={Icons.circleAdd} secondary size="medium">
                    Button
                </Button>
                <Button disabled size="medium">
                    Button
                </Button>
                <Button disabled secondary size="medium">
                    Button
                </Button>
                <Button disabled icon={Icons.circleAdd} size="medium">
                    Button
                </Button>
                <Button disabled icon={Icons.circleAdd} secondary size="medium">
                    Button
                </Button>

                {/* Small */}
                <Button size="small">Button</Button>
                <Button secondary size="small">
                    Button
                </Button>
                <Button icon={Icons.circleAdd} size="small">
                    Button
                </Button>
                <Button icon={Icons.circleAdd} secondary size="small">
                    Button
                </Button>
                <Button disabled size="small">
                    Button
                </Button>
                <Button disabled secondary size="small">
                    Button
                </Button>
                <Button disabled icon={Icons.circleAdd} size="small">
                    Button
                </Button>
                <Button disabled icon={Icons.circleAdd} secondary size="small">
                    Button
                </Button>
            </div>
        </div>
    );
};
