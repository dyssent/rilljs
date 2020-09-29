import React from 'react';

export const IconsNames = {
    Arrow: 'rill-icon-arrow'
};

export const Icons = React.memo(() => {
    return (
        <>
            <polygon id="rill-icon-arrow-shape"
                points="33.5117187 15.4013672 33.5117187 2 60.6623052 29 33.5117187 54.0185547 33.5117187 40.5654297 1 40.5654297 1 15.4013672"
            />
            <filter x="-4.2%" y="-6.2%" width="115.5%" height="119.9%" filterUnits="objectBoundingBox" id="rill-icon-shadow-outer">
                <feMorphology radius="0.5" operator="dilate" in="SourceAlpha" result="shadowSpreadOuter1"></feMorphology>
                <feOffset dx="4" dy="4" in="shadowSpreadOuter1" result="shadowOffsetOuter1"></feOffset>
                <feComposite in="shadowOffsetOuter1" in2="SourceAlpha" operator="out" result="shadowOffsetOuter1"></feComposite>
                <feColorMatrix values="0 0 0 0 0   0 0 0 0 0   0 0 0 0 0  0 0 0 0.5 0" type="matrix" in="shadowOffsetOuter1"></feColorMatrix>
            </filter>
            <filter x="-5.9%" y="-8.1%" width="118.8%" height="123.7%" filterUnits="objectBoundingBox" id="rill-icon-shadow-inner">
                <feGaussianBlur stdDeviation="2" in="SourceAlpha" result="shadowBlurInner1"></feGaussianBlur>
                <feOffset dx="2" dy="2" in="shadowBlurInner1" result="shadowOffsetInner1"></feOffset>
                <feComposite in="shadowOffsetInner1" in2="SourceAlpha" operator="arithmetic" k2="-1" k3="1" result="shadowInnerInner1"></feComposite>
                <feColorMatrix values="0 0 0 0 0.841795965   0 0 0 0 1   0 0 0 0 0.54839939  0 0 0 1 0" type="matrix" in="shadowInnerInner1"></feColorMatrix>
            </filter>
            <g id={IconsNames.Arrow} stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
                <g transform="scale(0.33)">
                    <use fill="black" fill-opacity="1" filter="url(#rill-icon-shadow-outer)" xlinkHref="#rill-icon-arrow-shape"></use>
                    <use fill="#93CA2D" fill-rule="evenodd" xlinkHref="#rill-icon-arrow-shape"></use>
                    <use fill="black" fill-opacity="1" filter="url(#rill-icon-shadow-inner)" xlinkHref="#rill-icon-arrow-shape"></use>
                    <use stroke="#709A21" stroke-width="1" xlinkHref="#rill-icon-arrow-shape"></use>
                </g>
            </g>
        </>
    );
});
