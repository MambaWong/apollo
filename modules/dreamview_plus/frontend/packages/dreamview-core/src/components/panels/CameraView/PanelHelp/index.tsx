import React from 'react';
import { useTranslation } from 'react-i18next';
import { SubContent, SubHeader, SubItem } from '../../base/PanelHelpContent';

export function CameraViewHelp() {
    const { t } = useTranslation('panels');

    return (
        <>
            <SubHeader>{t('panelHelpDesc')}</SubHeader>
            <SubContent>{t('cameraViewDescription')}</SubContent>
            <SubHeader>{t('panelHelpAbilityDesc')}</SubHeader>
            <SubItem>{t('cameraViewAbilityDesc')}</SubItem>
        </>
    );
}
