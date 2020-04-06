import styled from 'styled-components';

export const Main = styled.div<{dark?: boolean}>`
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 25px;
    min-height: 100vh;
    background-color: ${props => props.dark ? '#30404d' : '#f5f8fa'}
`;

export const Header = styled.div`
    max-width: 1024px;
    text-align: center;
`;

export const SpanBlue = styled.span`
    color: rgb(50,50,150);
    font-weight: 800;
`;

export const DemoHeader = styled.div<{cols: number}>`
    display: grid;
    grid-template-columns: repeat(${props => props.cols}, 1fr);
    grid-gap: 20px;
`;

export const DemoSampleHeader = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
`;

export const Footer = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
`;

export const FAQ = styled.div`
    max-width: 1024px;
    text-align: left;
`;