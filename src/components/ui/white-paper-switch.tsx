
'use client';

import React, { useState, useRef, useLayoutEffect } from 'react';
import './white-paper-switch.css'; 

type WorkType = 'books' | 'articles' | 'whitepapers' | 'abstracts';

interface WhitePaperSwitchProps {
  onChange?: (value: WorkType) => void;
  defaultSelected?: WorkType;
}

export function WhitePaperSwitch({ onChange, defaultSelected = 'books' }: WhitePaperSwitchProps) {
  const [selected, setSelected] = useState(defaultSelected);
  const indicatorRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleSelect = (value: WorkType) => {
    setSelected(value);
    onChange?.(value);
  };

  useLayoutEffect(() => {
    const container = containerRef.current;
    const indicator = indicatorRef.current;
    if (!container || !indicator) return;

    const selectedLabel = container.querySelector(`label[data-value="${selected}"]`) as HTMLLabelElement;
    if (selectedLabel) {
      indicator.style.width = `${selectedLabel.offsetWidth}px`;
      indicator.style.transform = `translateX(${selectedLabel.offsetLeft}px)`;
    }
  }, [selected]);
  
  const options: { value: WorkType, label: string }[] = [
    { value: 'books', label: 'Books' },
    { value: 'articles', label: 'Articles' },
    { value: 'whitepapers', label: 'White Papers' },
    { value: 'abstracts', label: 'Abstracts' },
  ];

  return (
    <div className="whitepaper-switch" ref={containerRef}>
        <div className="whitepaper-switch__indicator" ref={indicatorRef} />
        {options.map((option) => (
            <label key={option.value} data-value={option.value}>
                <input
                    className="sr-only"
                    type="radio"
                    name="work-type-switch"
                    value={option.value}
                    checked={selected === option.value}
                    onChange={() => handleSelect(option.value)}
                />
                <span>{option.label}</span>
            </label>
        ))}
    </div>
  );
}
