
'use client';

import React from 'react';
import type { ThemeStyles, StyleProperty } from '@/types';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../ui/accordion';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '../ui/select';
import { Button } from '../ui/button';
import { RotateCcw } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { RgbaStringColorPicker } from 'react-colorful';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { Separator } from '../ui/separator';

const GRADIENT_SWATCHES = [
  'linear-gradient(to right, #ff9933, #b8860b)',
  'linear-gradient(to right, #4facfe, #00f2fe)',
  'linear-gradient(to right, #fbc2eb, #a6c1ee)',
  'linear-gradient(to right, #84fab0, #8fd3f4)',
  'linear-gradient(to right, #d4fc79, #96e6a1)',
  'linear-gradient(to right, #a18cd1, #fbc2eb)',
  'linear-gradient(to right, #ffecd2, #fcb69f)',
  'linear-gradient(to right, #ff9a9e, #fad0c4)',
  'linear-gradient(45deg, #ff9a9e, #fecfef)',
  'linear-gradient(45deg, #c471f5, #fa71cd)',
];


interface ColorControlProps {
  label: string;
  value: string | undefined;
  defaultValue?: string;
  onChange: (value: string) => void;
  onReset: () => void;
}

function ColorControl({ label, value, onChange, onReset }: ColorControlProps) {
  const isGradient = value?.includes('gradient');
  
  const [gradientStart, setGradientStart] = React.useState('#ffffff');
  const [gradientEnd, setGradientEnd] = React.useState('#000000');
  const [gradientAngle, setGradientAngle] = React.useState('to right');
  const [activeGradientPicker, setActiveGradientPicker] = React.useState<'start' | 'end' | null>(null);

  React.useEffect(() => {
    if (isGradient && value) {
      const matches = value.match(/rgba?\((\d+,\s*\d+,\s*\d+(,\s*[\d.]+)?)\)|#([0-9a-fA-F]{6}|[0-9a-fA-F]{3})/g);
      if (value.startsWith('radial-gradient')) {
          setGradientAngle('circle');
      } else {
          const angleMatch = value.match(/to (right|left|top|bottom)( (right|left|top|bottom))?|\d+deg/);
          if (angleMatch) {
            setGradientAngle(angleMatch[0]);
          } else {
            setGradientAngle('to right'); // default
          }
      }

      if (matches && matches.length >= 2) {
        setGradientStart(matches[0]);
        setGradientEnd(matches[matches.length - 1]);
      }
    }
  }, [isGradient, value]);

  const handleGradientChange = () => {
      let gradientString;
      if (gradientAngle.includes('circle')) {
        gradientString = `radial-gradient(circle, ${gradientStart}, ${gradientEnd})`;
      } else {
        gradientString = `linear-gradient(${gradientAngle}, ${gradientStart}, ${gradientEnd})`;
      }
      onChange(gradientString);
  }

  return (
    <div className="grid grid-cols-2 items-center gap-2">
      <Label className="text-xs">{label}</Label>
      <div className="flex items-center gap-2">
         <Popover>
            <PopoverTrigger asChild>
                <Button
                type="button"
                variant="outline"
                className="h-8 w-8 p-0 border-border"
                style={{ background: value }}
                aria-label={`Select color for ${label}`}
                />
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 border-none">
                 <Tabs defaultValue="solid" className="w-[300px]">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="solid">Solid</TabsTrigger>
                        <TabsTrigger value="gradient">Gradient</TabsTrigger>
                    </TabsList>
                    <TabsContent value="solid" className="p-2">
                         <RgbaStringColorPicker color={isGradient ? 'rgba(0,0,0,1)' : (value || 'rgba(0,0,0,1)')} onChange={onChange} />
                    </TabsContent>
                    <TabsContent value="gradient" className="p-4 space-y-4">
                        <div className="flex justify-between gap-4">
                            <div className="space-y-2 text-center">
                                <Label className="text-xs">Start</Label>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button type="button" variant="outline" className="h-8 w-8 p-0" style={{ background: gradientStart }} />
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0 border-none"><RgbaStringColorPicker color={gradientStart} onChange={setGradientStart} /></PopoverContent>
                                </Popover>
                            </div>
                            <div className="space-y-2 text-center">
                                <Label className="text-xs">End</Label>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button type="button" variant="outline" className="h-8 w-8 p-0" style={{ background: gradientEnd }} />
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0 border-none"><RgbaStringColorPicker color={gradientEnd} onChange={setGradientEnd} /></PopoverContent>
                                </Popover>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label>Direction</Label>
                             <Select value={gradientAngle} onValueChange={setGradientAngle}>
                                <SelectTrigger><SelectValue/></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="to right">Left to Right</SelectItem>
                                    <SelectItem value="to bottom">Top to Bottom</SelectItem>
                                    <SelectItem value="to bottom right">Top-Left to Bottom-Right</SelectItem>
                                    <SelectItem value="45deg">45 Degrees</SelectItem>
                                    <SelectItem value="circle">Radial (Center)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <Button onClick={handleGradientChange} className="w-full">Apply Gradient</Button>
                        <Separator />
                        <div className="space-y-2">
                            <Label className="text-xs text-muted-foreground">Swatches</Label>
                            <div className="grid grid-cols-5 gap-2">
                                {GRADIENT_SWATCHES.map((swatch, i) => (
                                    <button
                                        key={i}
                                        type="button"
                                        className="h-8 w-8 rounded-full border border-border/50 transition-transform hover:scale-110"
                                        style={{ background: swatch }}
                                        onClick={() => onChange(swatch)}
                                        aria-label={`Apply gradient: ${swatch}`}
                                    />
                                ))}
                            </div>
                        </div>
                    </TabsContent>
                </Tabs>
            </PopoverContent>
        </Popover>
        <Input
          type="text"
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          className="h-8 flex-1"
          placeholder="#... or linear-gradient(...)"
        />
        <Button type="button" variant="ghost" size="icon" className="h-8 w-8" onClick={onReset} title={`Reset ${label}`}>
          <RotateCcw className="h-4 w-4 text-muted-foreground" />
        </Button>
      </div>
    </div>
  );
}


interface StyleGroupProps {
  title: string;
  element: keyof ThemeStyles;
  styles: StyleProperty;
  defaultStyles: StyleProperty;
  onStyleChange: (element: keyof ThemeStyles, property: string, value: string) => void;
}

const FONT_SIZES = [
    '12px', '14px', '16px', '18px', '20px', '22px', '24px', '28px', '32px', '36px', '48px', '60px', '72px'
];

const FONT_WEIGHTS = [
    { label: 'Thin', value: '100' },
    { label: 'Extra Light', value: '200' },
    { label: 'Light', value: '300' },
    { label: 'Regular', value: '400' },
    { label: 'Medium', value: '500' },
    { label: 'Semibold', value: '600' },
    { label: 'Bold', value: '700' },
    { label: 'Extra Bold', value: '800' },
    { label: 'Black', value: '900' },
];


function StyleGroup({ title, element, styles, defaultStyles, onStyleChange }: StyleGroupProps) {
  return (
    <AccordionItem value={element}>
      <AccordionTrigger className="text-sm">{title}</AccordionTrigger>
      <AccordionContent>
        <div className="space-y-2 p-2 bg-muted/50 rounded-md">
            <div className="grid grid-cols-2 items-center gap-2">
                <Label className="text-xs">Font Size</Label>
                <Select value={styles.fontSize} onValueChange={(v) => onStyleChange(element, 'fontSize', v)}>
                    <SelectTrigger className="h-8"><SelectValue placeholder="Size..." /></SelectTrigger>
                    <SelectContent>
                        {FONT_SIZES.map(size => (
                            <SelectItem key={size} value={size}>{size}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
            <ColorControl 
                label="Color"
                value={styles.color} 
                onChange={(v) => onStyleChange(element, 'color', v)} 
                onReset={() => onStyleChange(element, 'color', defaultStyles.color || '')}
            />
            <div className="grid grid-cols-2 items-center gap-2">
                <Label className="text-xs">Font Weight</Label>
                <Select value={styles.fontWeight} onValueChange={(v) => onStyleChange(element, 'fontWeight', v)}>
                    <SelectTrigger className="h-8"><SelectValue placeholder="Weight..." /></SelectTrigger>
                    <SelectContent>
                        {FONT_WEIGHTS.map(weight => (
                            <SelectItem key={weight.value} value={weight.value}>{weight.label}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
             <div className="grid grid-cols-2 items-center gap-2">
                <Label className="text-xs">Font Style</Label>
                <Select value={styles.fontStyle} onValueChange={(v) => onStyleChange(element, 'fontStyle', v)}>
                    <SelectTrigger className="h-8"><SelectValue placeholder="Style..." /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="normal">Normal</SelectItem>
                        <SelectItem value="italic">Italic</SelectItem>
                        <SelectItem value="oblique">Oblique</SelectItem>
                    </SelectContent>
                </Select>
            </div>
             <div className="grid grid-cols-2 items-center gap-2">
                <Label className="text-xs">Font Family</Label>
                <Select value={styles.fontFamily} onValueChange={(v) => onStyleChange(element, 'fontFamily', v)}>
                    <SelectTrigger className="h-8"><SelectValue placeholder="Family..." /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="Inter">Inter (Body)</SelectItem>
                        <SelectItem value="Literata">Literata (Headline)</SelectItem>
                        <SelectItem value="Adishila">Adishila (Sanskrit)</SelectItem>
                    </SelectContent>
                </Select>
            </div>
        </div>
      </AccordionContent>
    </AccordionItem>
  );
}

export function BookThemeControls({ styles, defaultStyles, onStyleChange }: { 
    styles: ThemeStyles, 
    defaultStyles: ThemeStyles, 
    onStyleChange: (element: keyof ThemeStyles, property: string, value: string) => void 
}) {
  const styleGroups = [
    { title: 'Heading 1', element: 'h1' },
    { title: 'Heading 2', element: 'h2' },
    { title: 'Heading 3', element: 'h3' },
    { title: 'Heading 4', element: 'h4' },
    { title: 'Heading 5', element: 'h5' },
    { title: 'Heading 6', element: 'h6' },
    { title: 'Paragraph', element: 'paragraph' },
    { title: 'Sutra', element: 'sutra' },
    { title: 'Bhashya', element: 'bhashya' },
    { title: 'Teeka', element: 'teeka' },
  ];
  const otherStyles = [
     { title: 'Citation', element: 'citation' },
     { title: 'Quotation', element: 'quotation' },
     { title: 'Version', element: 'version' },
     { title: 'Footnote', element: 'footnote' },
     { title: 'Special Note', element: 'specialNote' },
     { title: 'Table of Contents', element: 'toc' },
  ]
  return (
    <div className="p-4 border-r bg-background">
      <Accordion type="multiple" className="w-full" defaultValue={['h1']}>
          {styleGroups.map(group => (
              <StyleGroup
                  key={group.element}
                  title={group.title}
                  element={group.element as keyof ThemeStyles}
                  styles={styles[group.element as keyof ThemeStyles]}
                  defaultStyles={defaultStyles[group.element as keyof ThemeStyles]}
                  onStyleChange={onStyleChange}
              />
          ))}
      </Accordion>
       <Accordion type="multiple" className="w-full mt-4">
          <AccordionItem value="other">
              <AccordionTrigger className="text-base">Other Elements</AccordionTrigger>
              <AccordionContent className="p-2 space-y-4">
                  {otherStyles.map(group => (
                      <div key={group.element} className="p-2 border rounded-md">
                           <h4 className="text-sm font-semibold mb-2">{group.title}</h4>
                           <div className="space-y-2">
                              <ColorControl 
                                  label="Color" 
                                  value={styles[group.element as keyof ThemeStyles]?.color} 
                                  onChange={(v) => onStyleChange(group.element as keyof ThemeStyles, 'color', v)} 
                                  onReset={() => onStyleChange(group.element as keyof ThemeStyles, 'color', defaultStyles[group.element as keyof ThemeStyles]?.color || '')}
                              />
                              <ColorControl 
                                  label="Background"
                                  value={styles[group.element as keyof ThemeStyles]?.backgroundColor} 
                                  onChange={(v) => onStyleChange(group.element as keyof ThemeStyles, 'backgroundColor', v)} 
                                  onReset={() => onStyleChange(group.element as keyof ThemeStyles, 'backgroundColor', defaultStyles[group.element as keyof ThemeStyles]?.backgroundColor || '')}
                              />
                              <div className="grid grid-cols-2 items-center gap-2">
                                  <Label className="text-xs">Font Size</Label>
                                  <Select value={styles[group.element as keyof ThemeStyles]?.fontSize} onValueChange={(v) => onStyleChange(group.element as keyof ThemeStyles, 'fontSize', v)}>
                                      <SelectTrigger className="h-8"><SelectValue placeholder="Size..." /></SelectTrigger>
                                      <SelectContent>
                                          {FONT_SIZES.map(size => (
                                              <SelectItem key={size} value={size}>{size}</SelectItem>
                                          ))}
                                      </SelectContent>
                                  </Select>
                              </div>
                              <div className="grid grid-cols-2 items-center gap-2">
                                  <Label className="text-xs">Font Style</Label>
                                  <Select value={styles[group.element as keyof ThemeStyles]?.fontStyle} onValueChange={(v) => onStyleChange(group.element as keyof ThemeStyles, 'fontStyle', v)}>
                                      <SelectTrigger className="h-8"><SelectValue placeholder="Style..." /></SelectTrigger>
                                      <SelectContent>
                                          <SelectItem value="normal">Normal</SelectItem>
                                          <SelectItem value="italic">Italic</SelectItem>
                                      </SelectContent>
                                  </Select>
                              </div>
                           </div>
                      </div>
                  ))}
              </AccordionContent>
          </AccordionItem>
      </Accordion>
    </div>
  );
}
