export const tabletFQDN = (opts: {
    cell?: string | null | undefined;
    hostname?: string | null | undefined;
    uid?: number | string | null | undefined;
}): string => {
    const template = process.env.REACT_APP_TABLET_LINK_TEMPLATE;
    if (!template) {
        return '';
    }

    // This is truly so disgusting.
    let href = template.replace('{{hostname}}', opts.hostname || '');
    href = href.replace('{{uid}}', `${parseInt(`${opts.uid}`, 10)}`);
    return href;
};
