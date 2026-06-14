import { TestBed } from '@angular/core/testing';
import { RecommendationCardComponent } from './recommendation-card.component';

describe('RecommendationCardComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RecommendationCardComponent],
    }).compileComponents();
  });

  it('renders the recommendation title and confidence label', () => {
    const fixture = TestBed.createComponent(RecommendationCardComponent);
    fixture.componentInstance.recommendation = {
      title: 'Halo Infinite',
      reason: 'Matched public profile language that points toward shooter-heavy play.',
      confidence: 0.92,
    };
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;

    expect(compiled.textContent).toContain('Halo Infinite');
    expect(compiled.textContent).toContain('92% match');
  });

  it('falls back to the Foundry suggestion label when confidence is missing', () => {
    const fixture = TestBed.createComponent(RecommendationCardComponent);
    fixture.componentInstance.recommendation = {
      title: 'Forza Horizon 5',
      reason: 'Fallback recommendation based on broad mainstream appeal.',
    };
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;

    expect(compiled.textContent).toContain('Forza Horizon 5');
    expect(compiled.textContent).toContain('Foundry suggestion');
  });
});
