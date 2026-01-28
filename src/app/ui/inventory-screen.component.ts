import { Component, EventEmitter, Input, Output } from '@angular/core';
import type { InventoryItem } from '@neo-tokyo/core';

type FilterType = 'all' | 'weapon' | 'accessory' | 'consumable' | 'key_item';

@Component({
  selector: 'app-inventory-screen',
  templateUrl: './inventory-screen.component.html',
  styleUrls: ['./inventory-screen.component.scss'],
})
export class InventoryScreenComponent {
  @Input() isOpen = false;
  @Input() inventory: InventoryItem[] = [];
  @Input() credits = 0;
  @Output() close = new EventEmitter<void>();
  @Output() useItem = new EventEmitter<InventoryItem>();
  @Output() equipItem = new EventEmitter<InventoryItem>();

  selectedItem: InventoryItem | null = null;
  filter: FilterType = 'all';
  filters: FilterType[] = ['all', 'weapon', 'accessory', 'consumable', 'key_item'];

  setFilter(filter: FilterType) {
    this.filter = filter;
    this.selectedItem = null;
  }

  filteredInventory(): InventoryItem[] {
    if (this.filter === 'all') return this.inventory;
    return this.inventory.filter((item) => item.type === this.filter);
  }

  getItemTypeColor(type: InventoryItem['type']): string {
    switch (type) {
      case 'weapon':
        return '#ef4444';
      case 'accessory':
        return '#a855f7';
      case 'consumable':
        return '#10b981';
      case 'key_item':
        return '#f59e0b';
      default:
        return '#64748b';
    }
  }

  getItemTypeIcon(type: InventoryItem['type']): string {
    switch (type) {
      case 'weapon':
        return '⚔️';
      case 'accessory':
        return '💎';
      case 'consumable':
        return '🧪';
      case 'key_item':
        return '🔑';
      default:
        return '📦';
    }
  }

  handleUseItem(): void {
    if (this.selectedItem) {
      this.useItem.emit(this.selectedItem);
    }
  }

  handleEquipItem(): void {
    if (this.selectedItem) {
      this.equipItem.emit(this.selectedItem);
    }
  }
}
