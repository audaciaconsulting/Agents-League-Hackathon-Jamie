import { TestBed } from '@angular/core/testing';
import { SourceCardComponent } from './source-card.component';

describe('SourceCardComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SourceCardComponent],
    }).compileComponents();
  });

  it('renders the source label, state, and details', () => {
    const fixture = TestBed.createComponent(SourceCardComponent);
    fixture.componentInstance.source = {
      id: 'steam',
      label: 'Steam',
      state: 'live',
      note: 'Steam public profile lookup is available through the adapter.',
      profile: {
        steamId: 'gaben',
        customUrl: 'gabesgames',
        memberSince: '2004',
        summary: 'Public profile summary.',
      },
    };
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;

    expect(compiled.textContent).toContain('gaben');
    expect(compiled.textContent).toContain('live');
    expect(compiled.textContent).toContain('Custom URL: gabesgames');
    expect(compiled.textContent).toContain('Member since: 2004');
  });

  it('renders HTML summary content when the profile summary contains markup', () => {
    const fixture = TestBed.createComponent(SourceCardComponent);
    fixture.componentInstance.source = {
      id: 'steam',
      label: 'Steam',
      state: 'live',
      note: 'Steam public profile lookup is available through the adapter.',
      profile: {
        steamId: 'gaben',
        summary: '<strong>Public profile</strong> summary.',
      },
    };
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;

    expect(compiled.querySelector('.source-summary strong')).not.toBeNull();
    expect(compiled.textContent).toContain('Public profile summary.');
  });
});
