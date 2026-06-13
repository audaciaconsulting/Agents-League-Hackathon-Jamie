import { Component, Input } from '@angular/core';

export interface Recommendation {
  title: string;
  reason?: string;
  confidence?: number;
}

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
