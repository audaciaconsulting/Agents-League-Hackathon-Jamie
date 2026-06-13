import { TestBed } from '@angular/core/testing';
import { App } from './app';

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('should render title', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Public-data gaming insights');
  });

  it('should render recommendation cards from raw response data', () => {
    const fixture = TestBed.createComponent(App);
    fixture.componentInstance.recommendations = [
      {
        title: 'Forza Horizon 5',
        reason: 'Matched public profile language that points toward driving and racing.',
        confidence: 0.84,
      },
    ];
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;

    expect(compiled.textContent).toContain('Forza Horizon 5');
    expect(compiled.textContent).toContain('84% match');
  });

  it('should render duplicate recommendation titles without collapsing cards', () => {
    const fixture = TestBed.createComponent(App);
    fixture.componentInstance.recommendations = [
      {
        title: 'Halo Infinite',
        reason: 'Matched public profile language that points toward shooter-heavy play.',
      },
      {
        title: 'Halo Infinite',
        reason: 'Nearby recommendation based on the same public profile theme.',
      },
    ];
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;

    expect(compiled.querySelectorAll('.recommendation-card')).toHaveLength(2);
    expect(compiled.textContent).toContain('Nearby recommendation based on the same public profile theme.');
  });
});
