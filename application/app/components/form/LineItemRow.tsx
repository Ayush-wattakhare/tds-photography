'use client'

import type { LineItem } from '../../types/quotation'

interface Props {
  item: LineItem
  index: number
  canRemove: boolean
  onUpdate: (id: string, field: keyof LineItem, value: string) => void
  onRemove: (id: string) => void
}

const INPUT =
  'w-full px-3 py-2 rounded-lg border border-[#C8BFAA]/60 bg-[#F5F3EA] text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#8C7E5E]/30 focus:border-[#8C7E5E] transition'

export default function LineItemRow({ item, index, canRemove, onUpdate, onRemove }: Props) {
  return (
    <div className="bg-[#EEECE2] rounded-xl border border-[#C8BFAA]/40 p-3">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[10px] font-semibold text-[#8C7E5E] uppercase tracking-widest">
          Item {index + 1}
        </span>
        {canRemove && (
          <button
            type="button"
            onClick={() => onRemove(item.id)}
            className="text-[10px] text-red-400 hover:text-red-600 transition"
          >
            Remove
          </button>
        )}
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div className="col-span-2">
          <input
            className={INPUT}
            placeholder="Description (e.g. Mumbai 3Bhk)"
            value={item.description}
            onChange={(e) => onUpdate(item.id, 'description', e.target.value)}
          />
        </div>
        <input
          className={INPUT}
          placeholder="Photos (e.g. 30)"
          value={item.photos}
          onChange={(e) => onUpdate(item.id, 'photos', e.target.value)}
        />
        <input
          className={INPUT}
          placeholder="Reels/Video (e.g. 04)"
          value={item.reels}
          onChange={(e) => onUpdate(item.id, 'reels', e.target.value)}
        />
        <div className="col-span-2">
          <input
            className={INPUT}
            placeholder="Row total amount (e.g. 16000)"
            value={item.total}
            onChange={(e) => onUpdate(item.id, 'total', e.target.value)}
          />
        </div>
      </div>
    </div>
  )
}
