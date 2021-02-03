import * as React from 'react';
import { Theme, useTheme } from '../../hooks/useTheme';
import { Button } from '../Button';
import { Icon, Icons } from '../Icon';
import { ComboBox } from '../lib/ComboBox';
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

            <h3>Icons</h3>
            <div className={style.iconContainer}>
                {Object.values(Icons).map((i) => (
                    <Icon className={style.icon} icon={i} key={i} />
                ))}
            </div>

            <h3>ComboBox</h3>
            <div className={style.inputContainer}>
                <ComboBox />
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
