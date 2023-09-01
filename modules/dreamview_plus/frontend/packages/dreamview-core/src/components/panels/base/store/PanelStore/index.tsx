import { createContext, useContext } from 'react';
import Logger from '@dreamview/log';
import { MosaicDirection } from 'react-mosaic-component';
import { OnResizeCallback } from 'react-resize-detector/build/types/types';
import { SubscribeInfo } from '../../../type/RenderToolBar';
import { KeyHandlers } from '../../KeyListener';

export type DataConsumer = (data: unknown) => void;
export type Unsubscribe = (subscribersCount: number) => void;
export type PanelMetaData = { panelId?: string } & Record<string, any>;
export type InitSubscriptionMap = Record<string, { consumer: DataConsumer }>;
export interface IPanelContext {
    panelId: string;
    initSubscription: (value: InitSubscriptionMap) => void;
    logger: Logger;
    metaData: PanelMetaData;
    splitPanel: (direction: MosaicDirection) => void;
    closePanel: () => void;
    updateMetaData: (newMetaData: PanelMetaData) => void;
    enterFullScreen: () => void;
    exitFullScreen: () => void;
    onPanelResize: (onResize: OnResizeCallback) => void;
    data: Record<string, any>;
    addChannel: (newChannelInfo: SubscribeInfo) => void;
    updateChannel: (newChannel: SubscribeInfo) => void;
    closeSubcription: (name: string) => void;
    setKeyUpHandlers: (handlers: KeyHandlers[]) => void;
    setKeyDownHandlers: (handlers: KeyHandlers[]) => void;
}

export const PanelContext = createContext<IPanelContext | undefined>(undefined);

export function usePanelContext(): IPanelContext {
    return useContext(PanelContext);
}
