import { useMakeStyle } from '@dreamview/dreamview-theme';

export default function useStyle() {
    const hoc = useMakeStyle((theme) => ({
        'viz-container': {
            padding: theme.tokens.padding.speace0,
            minWidth: '244px',
            height: '100%',
            position: 'relative',
        },
        'web-gl': {
            width: '100%',
            height: '100%',
        },
        'layer-menu-container': {
            padding: theme.tokens.padding.speace0,
            width: '532px',
            height: '340px',
            background: '#282B36',
            borderRadius: '8px',
        },
        'layer-menu-header': {
            lineHeight: '40px',
            height: '40px',
            borderBottom: '1px solid #383B45',
        },
        'layer-menu-header-left': {
            paddingLeft: '24px',
            paddingRight: theme.tokens.padding.speace2,
            fontFamily: 'PingFangSC-Medium',
            fontSize: '16px',
            color: '#FFFFFF',
            fontWeight: '500',
        },
        'layer-menu-header-right': {
            float: 'right',
            marginTop: '-46px',
            marginRight: theme.tokens.padding.speace2,
        },
        'layer-menu-header-reset-btn': {
            lineHeight: '28px',
            marginTop: '10px',
            borderRadius: '6px',
            border: '1px solid rgba(124,136,153,1)',
            padding: '0px 10px',
            cursor: 'pointer',
            color: '#A6B5CC',
        },
        'layer-menu-content': {
            display: 'flex',
            flexDirection: 'row',
            padding: '20px 0 20px 16px',
        },
        'layer-menu-content-left': {
            borderRight: '1px solid #383B45',
            width: '126px',
        },
        'layer-menu-content-left-li': {
            paddingLeft: '16px',
            width: '110px',
            height: '32px',
            lineHeight: '32px',
            cursor: 'pointer',
            marginBottom: '6px',
            color: '#808B9D',
            fontWeight: '400',
            fontFamily: ' PingFangSC-Regular',
        },
        'li-active': {
            color: '#FFFFFF',
            background: '#3288FA',
            borderRadius: '6px',
        },
        'layer-menu-content-right': {
            paddingLeft: theme.tokens.padding.speace2,
            flex: 1,
            overflowY: 'auto',
            height: '268px',
        },
        'layer-menu-content-right-li': {
            '&:nth-of-type(2n + 1)': {
                width: '150px',
            },
            '&:nth-of-type(2n + 2)': {
                width: '216px',
            },
            height: '34px',
            lineHeight: '34px',
            display: 'inline-block',
        },
        'layer-menu-horizontal-line': {
            height: '1px',
            background: '#383B45',
            margin: '8px 12px 8px 0',
        },
        'layer-menu-content-right-switch': {
            paddingLeft: theme.tokens.padding.speace,
            paddingRight: theme.tokens.padding.speace,
        },
        'layer-menu-content-right-label': {
            color: '#A6B5CC',
            fontWeight: '400',
            verticalAlign: 'middle',
            fontFamily: ' PingFangSC-Regular',
        },
        'viz-btn-container': {
            position: 'absolute',
            bottom: '24px',
            right: theme.tokens.padding.speace2,
            display: 'flex',
            flexDirection: 'column',
        },
        'viz-btn-item': {
            display: 'inline-block',
            cursor: 'pointer',
            textAlign: 'center',
            width: '32px',
            height: '32px',
            lineHeight: '32px',
            background: '#343C4D',
            borderRadius: '6px',
            marginTop: '12px',
            fontSize: '16px',
            color: '#96A5C1',
        },
        'view-menu-item': {
            height: '32px',
            lineHeight: '32px',
            color: '#A6B5CC',
            cursor: 'pointer',
            paddingLeft: '24px',
            fontFamily: 'PingFangSC-Regular',
            fontSize: '14px',
            fontWeight: '400',
        },
        'view-menu-btn-container': {
            marginTop: '12px',
            width: '32px',
            height: '56px',
            background: '#343C4D',
            borderRadius: '6px',
            fontSize: '20px',
            fontWeight: '600',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
        },
        'view-menu-btn-item': {
            cursor: 'pointer',
        },
        'view-menu-container': {
            width: '158px',
            background: '#282B36',
            borderRadius: '8px',
            paddingBottom: '8px',
        },
        'view-menu-header': {
            height: '40px',
            color: '#FFFFFF',
            fontSize: '16px',
            fontWeight: '500',
            fontFamily: 'PingFangSC-Medium',
            lineHeight: '40px',
            paddingLeft: '24px',
            marginBottom: '8px',
            borderBottom: '1px solid rgba(151,151,151,1)',
        },
        'view-menu-active': {
            background: 'rgba(115,193,250,0.08)',
            color: '#3288FA',
        },
        'panel-desc-item': {
            lineHeight: '76px',

            display: 'flex',
            justifyContent: 'center',
            '&:not(:last-of-type)': {
                borderBottom: '1px solid #383B45',
            },
        },
        'panel-desc-item-left': {
            width: '170px',
        },
        'panel-desc-item-right': {
            width: '584px',
            height: '22px',
            color: '#808B9D',
            fontWeight: 400,
            fontFamily: 'PingFangSC-Regular',
        },
    }));
    return hoc();
}
