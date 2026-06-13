import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-root',
  imports: [CommonModule, FormsModule],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  private readonly http = inject(HttpClient);

  protected gamertag = '';
  protected isLoading = false;
  protected statusTitle = 'Waiting for a gamertag';
  protected statusCopy = 'Add a name to inspect public signals and Foundry output.';
  protected statusTone: 'idle' | 'busy' | 'ready' | 'error' = 'idle';
  protected sourceStatuses: Array<{
    id: string;
    label: string;
    state: string;
    note: string;
    profile?: {
      steamId?: string;
      avatarFull?: string;
      customUrl?: string;
      memberSince?: string;
      location?: string;
      stateMessage?: string;
      summary?: string;
    };
  }> = [
    {
      id: 'steam',
      label: 'Steam',
      state: 'planned',
      note: 'Steam public profile lookup is available through the adapter.',
    },
  ];
  protected recommendations: Array<{
    title: string;
    reason?: string;
    confidence?: number;
  }> = [];
  protected recommendationsSummary = 'No analysis has run yet.';

  protected get statusBadgeLabel(): string {
    if (this.statusTone === 'busy') {
      return 'Running';
    }

    if (this.statusTone === 'error') {
      return 'Blocked';
    }

    if (this.statusTone === 'ready') {
      return 'Ready';
    }

    return 'Idle';
  }

  protected async analyzeGamertag(): Promise<void> {
    const normalizedGamertag = this.gamertag.trim();

    if (normalizedGamertag.length < 3) {
      this.statusTone = 'error';
      this.statusTitle = 'Enter a longer gamertag';
      this.statusCopy = 'Use at least three characters so the analysis request can run.';
      return;
    }

    this.isLoading = true;
    this.statusTone = 'busy';
    this.statusTitle = `Analyzing ${normalizedGamertag}`;
    this.statusCopy = 'Checking public source availability and preparing the Foundry payload.';
    this.recommendationsSummary = 'Running analysis...';

    try {
      const response = await firstValueFrom(
        this.http.post<{
          gamertag: string;
          summary: string;
          sourceStatuses?: typeof this.sourceStatuses;
          recommendations?: typeof this.recommendations;
          foundry?: { connected?: boolean };
        }>('/api/analyze', { gamertag: normalizedGamertag })
      );

      this.statusTone = response.foundry?.connected ? 'ready' : 'error';
      this.statusTitle = `Results for ${response.gamertag}`;
      this.statusCopy = response.summary;
      this.sourceStatuses = response.sourceStatuses || [];
      this.recommendations = response.recommendations || [];
      this.recommendationsSummary = response.summary;
    } catch (error) {
      this.statusTone = 'error';
      this.statusTitle = 'Analysis failed';
      this.statusCopy = error instanceof Error ? error.message : 'Unexpected error.';
      this.recommendations = [];
      this.recommendationsSummary = 'The request did not complete. Check the server output and try again.';
    } finally {
      this.isLoading = false;
    }
  }
}
