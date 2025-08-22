
'use client'

import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useState,
} from 'react'

import { cn } from '@/lib/utils';
import { Transliterate } from '@/components/transliteration-provider';

interface SuggestionListProps {
  items: { id: string; label: string }[];
  command: (item: { id: string }) => void;
}

const SuggestionList = forwardRef((props: SuggestionListProps, ref) => {
  const [selectedIndex, setSelectedIndex] = useState(0)

  const selectItem = (index: number) => {
    const item = props.items[index]

    if (item) {
      props.command({ id: item.id })
    }
  }

  const upHandler = () => {
    setSelectedIndex((selectedIndex + props.items.length - 1) % props.items.length)
  }

  const downHandler = () => {
    setSelectedIndex((selectedIndex + 1) % props.items.length)
  }

  const enterHandler = () => {
    selectItem(selectedIndex)
  }

  useEffect(() => setSelectedIndex(0), [props.items])

  useImperativeHandle(ref, () => ({
    onKeyDown: ({ event }: { event: React.KeyboardEvent }) => {
      if (event.key === 'ArrowUp') {
        upHandler()
        return true
      }

      if (event.key === 'ArrowDown') {
        downHandler()
        return true
      }

      if (event.key === 'Enter') {
        enterHandler()
        return true
      }

      return false
    },
  }))

  return (
    <div className="bg-background border shadow-lg rounded-md p-2 w-96 text-sm">
      {props.items.length
        ? props.items.map((item, index) => (
            <button
              className={cn(
                "flex items-center w-full text-left p-2 rounded-md",
                index === selectedIndex ? 'bg-muted' : ''
              )}
              key={index}
              onClick={() => selectItem(index)}
            >
              <Transliterate>{item.label}</Transliterate>
            </button>
          ))
        : <div className="p-2">No results</div>}
    </div>
  )
})

SuggestionList.displayName = 'SuggestionList'

export default SuggestionList;
