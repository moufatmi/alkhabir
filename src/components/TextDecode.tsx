import React, { useState, useEffect, useRef } from 'react';

interface TextDecodeProps {
    text: string;
    className?: string;
    speed?: number;
}

const TextDecode: React.FC<TextDecodeProps> = ({ text, className, speed = 40 }) => {
    const [displayText, setDisplayText] = useState('');
    const chars = '01ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()';
    const animationRef = useRef<any>();

    useEffect(() => {
        let iteration = 0;
        const maxIterations = text.length;

        const decode = () => {
            const decoded = text
                .split('')
                .map((char, index) => {
                    if (index < iteration) {
                        return text[index];
                    }
                    if (char === ' ') return ' ';
                    return chars[Math.floor(Math.random() * chars.length)];
                })
                .join('');

            setDisplayText(decoded);

            if (iteration < maxIterations) {
                iteration += 1 / 3;
                animationRef.current = window.setTimeout(decode, speed);
            }
        };

        decode();

        return () => {
            if (animationRef.current) clearTimeout(animationRef.current);
        };
    }, [text, speed]);

    return <span className={className}>{displayText}</span>;
};

export default TextDecode;
