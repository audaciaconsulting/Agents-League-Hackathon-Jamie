import { Component, Input } from '@angular/core';
import type { Recommendation } from '../../interfaces/recommendation.interface';

@Component({
  selector: 'app-recommendation-card',
  standalone: true,
  templateUrl: './recommendation-card.component.html',
  styleUrl: './recommendation-card.component.css',
})
export class RecommendationCardComponent {
  @Input({ required: true })
  recommendation!: Recommendation;

  protected get confidenceLabel(): string {
    if (this.recommendation.confidence === undefined) {
      return 'Foundry suggestion';
    }

    return `${Math.round(this.recommendation.confidence * 100)}% match`;
  }
}
