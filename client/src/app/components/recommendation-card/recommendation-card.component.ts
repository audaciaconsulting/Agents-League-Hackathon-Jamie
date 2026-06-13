import { Component, Input } from '@angular/core';
import type { Recommendation } from '../../interfaces/recommendation.interface';

@Component({
  selector: 'app-recommendation-card',
  templateUrl: './recommendation-card.component.html',
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
