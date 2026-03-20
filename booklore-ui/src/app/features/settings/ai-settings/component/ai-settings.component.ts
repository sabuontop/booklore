import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { InputTextModule } from 'primeng/inputtext';
import { AppSettingsService } from '../../../../shared/service/app-settings.service';
import { AISettings, AppSettingKey } from '../../../../shared/model/app-settings.model';
import { MessageService } from 'primeng/api';
import { TranslocoService, TranslocoDirective } from '@jsverse/transloco';

@Component({
  selector: 'app-ai-settings',
  standalone: true,
  imports: [CommonModule, FormsModule, ToggleSwitchModule, InputTextModule, TranslocoDirective],
  templateUrl: './ai-settings.component.html',
  styleUrl: './ai-settings.component.scss'
})
export class AISettingsComponent implements OnInit {
  private appSettingsService = inject(AppSettingsService);
  private messageService = inject(MessageService);
  private t = inject(TranslocoService);

  aiSettings?: AISettings;

  ngOnInit(): void {
    this.appSettingsService.appSettings$.subscribe(settings => {
      if (settings?.aiSettings) {
        this.aiSettings = { ...settings.aiSettings };
      } else {
        this.aiSettings = {
          enabled: false,
          apiKey: '',
          baseUrl: 'https://api.groq.com/openai/v1/chat/completions',
          model: 'llama-3.3-70b-versatile'
        };
      }
    });
  }

  save() {
    if (!this.aiSettings) return;
    
    this.appSettingsService.saveSettings([{
      key: AppSettingKey.AI_SETTINGS,
      newValue: this.aiSettings
    }]).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: this.t.translate('settingsApp.settingsSaved'),
          detail: 'Paramètres IA mis à jour avec succès.'
        });
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Erreur',
          detail: 'Impossible de sauvegarder les paramètres IA.'
        });
      }
    });
  }
}
