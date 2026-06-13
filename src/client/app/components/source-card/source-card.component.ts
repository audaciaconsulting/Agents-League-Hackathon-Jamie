import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import type { SourceStatus } from '../../interfaces/source-status.interface';

@Component({
  selector: 'app-source-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './source-card.component.html',
  styleUrl: './source-card.component.css'
})
export class SourceCardComponent {
  @Input({ required: true })
  source!: SourceStatus;

  protected get sourceDisplayName(): string {
    return this.source.profile?.steamId || this.source.label;
  }

  protected get avatarAltText(): string {
    return `${this.sourceDisplayName} avatar`;
  }

  protected get hasProfileDetails(): boolean {
    return Boolean(
      this.source.profile?.customUrl ||
        this.source.profile?.memberSince ||
        this.source.profile?.location ||
        this.source.profile?.stateMessage
    );
  }

  protected get hasGameNames(): boolean {
    return Boolean(this.source.gameNames?.length);
  }
}
