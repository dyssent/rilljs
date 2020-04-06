import React, { useMemo } from 'react';

import { Coords } from '../../model';
import { BaseProps } from '../Components';

export enum TextAlignment {
    Left,
    Right,
    Middle
}

export enum TextVerticalAlignment {
    Top,
    Bottom,
    Middle
}

export enum TextOverflow {
    Overflow,
    Wrap,
    Ellipsis
}

export interface TextBoxProps extends BaseProps {
    text: string;

    width: number;
    height: number;
    pos: Coords;

    alignment?: TextAlignment;
    verticalAlignment?: TextVerticalAlignment;

    overflow?: TextOverflow;

    lineHeight?: number;
}

export const TextBox = React.memo((props: TextBoxProps) => {
    const {
        text,
        width,
        height,
        pos,
        alignment = TextAlignment.Left,
        verticalAlignment = TextVerticalAlignment.Top,
        lineHeight,
        style,
        overflow = TextOverflow.Overflow,
        className
    } = props;

    const lines = useMemo(() => {
        function computeTextDimensions(value: string, breakWords: boolean) {
            const words = breakWords ? value.split(/\s+/) : [value];
            let maxHeight = 0;
            const svgElement = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
            const textElement = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            if (style || className) {
                if (style) {
                    Object.assign(textElement.style, style);
                }
                if (className) {
                    textElement.classList.add(className);
                }
            }
            svgElement.appendChild(textElement);
            document.body.appendChild(svgElement);
            
            const wordsDims = words.map(word => {
                textElement.textContent = word;
                const textHeight = textElement.getBoundingClientRect().height;
                if (maxHeight < textHeight) {
                    maxHeight = textHeight;
                }
                return {
                    word,
                    width: textElement.getComputedTextLength(),
                    height: textHeight
                };
            })
        
            textElement.textContent = '\u00A0'; // Unicode space
            const spaceWidth = textElement.getComputedTextLength();
            textElement.textContent = '...';
            const ellipsisWidth = textElement.getComputedTextLength();
            document.body.removeChild(svgElement);
            return { words: wordsDims, spaceWidth, ellipsisWidth, maxHeight }
        }

        const data = computeTextDimensions(text, overflow !== TextOverflow.Overflow);
        const wordsLines: Array<{line: string, width: number}> = [];

        switch (overflow) {
            case TextOverflow.Overflow:
                wordsLines.push({
                    line: data.words[0].word,
                    width: data.words[0].width
                });
                break;

            case TextOverflow.Ellipsis:
            case TextOverflow.Wrap:
                const ellipsisOffset = overflow === TextOverflow.Ellipsis ? data.ellipsisWidth : 0;
                for (let i = 0; i < data.words.length; i++) {
                    const w = data.words[i];
                    let lineText: string = w.word;
                    let lineWidth: number = w.width;
                    while (lineWidth < width && i < data.words.length - 1) {
                        const next = data.words[i + 1];
                        if (lineWidth + data.spaceWidth + next.width + ellipsisOffset < width) {
                            lineText += ' ' + next.word;
                            lineWidth += data.spaceWidth + next.width;
                            i++;
                        } else {
                            break;
                        }
                    }
                    wordsLines.push({
                        line: lineText,
                        width: lineWidth
                    });
                    if (overflow === TextOverflow.Ellipsis && i >= data.words.length) {
                        wordsLines[0].line += '...';
                        wordsLines[0].width += data.ellipsisWidth;
                        break;
                    }
                }
                break;
        }

        const res = {
            x: 0,
            y: 0,
            dominantBaseline: 'hanging',
            textAnchor: 'start',
            wordsLines,
            lineHeight: typeof lineHeight === 'undefined' ? data.maxHeight : lineHeight
        };

        switch (alignment) {
            case TextAlignment.Left:
                res.textAnchor = 'start';
                break;
            case TextAlignment.Right:
                res.textAnchor = 'end';
                res.x += width;
                break;
            case TextAlignment.Middle:
                res.textAnchor = 'middle';
                res.x += width / 2;
                break;
        }

        switch (verticalAlignment) {
            case TextVerticalAlignment.Top:
                res.dominantBaseline = 'hanging';
                break;
            case TextVerticalAlignment.Bottom:
                res.dominantBaseline = 'baseline';
                res.y += height;
                break;
            case TextVerticalAlignment.Middle:
                res.dominantBaseline = 'middle';
                res.y += height / 2;
                if (wordsLines.length > 1) {
                    res.y -= (wordsLines.length - 1) * res.lineHeight / 2;
                }
                break;
        }
        return res;
    }, [text, lineHeight, style, overflow, alignment, height, verticalAlignment, width, className]);

    return (
        <text
            style={style}
            dominantBaseline={lines.dominantBaseline}
            textAnchor={lines.textAnchor}
            className={className}
        >
            {
                lines.wordsLines.map(({line}, index) =>
                    <tspan
                        key={index}
                        x={lines.x + pos.x}
                        y={lines.y + pos.y}
                        dy={index * lines.lineHeight}
                    >
                        {line}
                    </tspan>
                )
            }
        </text>
    );
});

