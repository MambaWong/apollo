import React, { useMemo, useState } from 'react';
import { Select, Switch, Tabs } from '@dreamview/dreamview-ui';
import { ENUM_DOWNLOAD_STATUS } from '@dreamview/dreamview-core/src/services/api/types';
import { useTranslation } from 'react-i18next';
import { TFunction } from 'i18next';
import MenuDrawerTitle from '../Common/MenuDrawerTitle';
import useStyle from './useStyle';
import { ProfileManagerProvider, useProfileManagerContext, ENUM_PROFILEMANAGER_TAB } from './provider';
import Recorders from './Recorders';
import Scenarios from './Scenarios';
import Vehicle from './Vehicle';
import V2X from './V2X';

const VariableResourcesItems = (t: TFunction) => [
    {
        label: t('records'),
        key: ENUM_PROFILEMANAGER_TAB.Records,
        children: <Recorders />,
    },
    {
        label: t('scenarios'),
        key: ENUM_PROFILEMANAGER_TAB.Scenarios,
        children: <Scenarios />,
    },
    {
        label: t('vehicle'),
        key: ENUM_PROFILEMANAGER_TAB.Vehicle,
        children: <Vehicle />,
    },
    {
        label: t('V2X'),
        key: ENUM_PROFILEMANAGER_TAB.V2X,
        children: <V2X />,
    },
];

const mode = (t: TFunction) => [
    {
        label: t('all'),
        value: 'all',
    },
    {
        label: t('downloading'),
        value: ENUM_DOWNLOAD_STATUS.DOWNLOADING,
    },
    {
        label: t('downloadSuccess'),
        value: ENUM_DOWNLOAD_STATUS.DOWNLOADED,
    },
    {
        label: t('downloadFail'),
        value: ENUM_DOWNLOAD_STATUS.Fail,
    },
    {
        label: t('tobedownload'),
        value: ENUM_DOWNLOAD_STATUS.TOBEUPDATE,
    },
];

function ProfileManager() {
    const { classes } = useStyle();
    const { t: tFilter } = useTranslation('profileManagerFilter');
    const { t: tMain } = useTranslation('profileManager');

    const { filter, setFilter, activeTab, setTab } = useProfileManagerContext();

    const onChange = (v: any) => {
        setFilter({ downLoadStatus: v });
    };

    const { options, tabs } = useMemo(
        () => ({
            options: mode(tFilter),
            tabs: VariableResourcesItems(tMain),
        }),
        [tFilter, tMain],
    );

    return (
        <div>
            <MenuDrawerTitle border={false} title={tMain('title')} />
            <div className={classes['profile-manager-container']}>
                <div className={classes['profile-manager-tab-container']}>
                    <div className={classes['profile-manager-tab-select']}>
                        {tMain('state')}
                        ：
                        <Select onChange={onChange} value={filter.downLoadStatus} options={options} />
                    </div>
                    <Tabs
                        onChange={setTab}
                        activeKey={activeTab}
                        rootClassName={classes['profile-manager-tab']}
                        items={tabs}
                    />
                </div>
            </div>
        </div>
    );
}

const ProfileManagerMemo = React.memo(ProfileManager);

export default function ProfileManagerWithContext() {
    return (
        <ProfileManagerProvider>
            <ProfileManagerMemo />
        </ProfileManagerProvider>
    );
}
