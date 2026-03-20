import { Component, ElementRef, ViewChild, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { AIAssistantService } from '../service/ai-assistant.service';
import { AppSettingsService } from '../../../shared/service/app-settings.service';
import { map } from 'rxjs/operators';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

@Component({
  selector: 'app-ai-assistant',
  standalone: true,
  imports: [CommonModule, FormsModule, InputTextModule, ButtonModule],
  templateUrl: './ai-assistant.component.html',
  styleUrls: ['./ai-assistant.component.scss']
})
export class AIAssistantComponent {
  private aiService = inject(AIAssistantService);
  private appSettingsService = inject(AppSettingsService);
  
  isAvailable$ = this.appSettingsService.publicAppSettings$.pipe(
    map(s => s?.aiEnabled ?? false)
  );
  
  isOpen = false;
  userInput = '';
  isTyping = false;
  messages: Message[] = [
    { role: 'assistant', content: 'Bonjour ! Je suis votre assistant Booklore. Comment puis-je vous aider avec votre bibliothèque aujourd\'hui ?' }
  ];

  @ViewChild('scrollContainer') private scrollContainer!: ElementRef;

  toggle() {
    this.isOpen = !this.isOpen;
    if (this.isOpen) {
      this.scrollToBottom();
    }
  }

  sendMessage() {
    if (!this.userInput.trim() || this.isTyping) return;

    const userMsg = this.userInput.trim();
    this.messages.push({ role: 'user', content: userMsg });
    this.userInput = '';
    this.isTyping = true;
    this.scrollToBottom();

    this.aiService.chat(userMsg).subscribe({
      next: (res) => {
        this.messages.push({ role: 'assistant', content: res.response });
        this.isTyping = false;
        this.scrollToBottom();
      },
      error: (err) => {
        console.error('AI Error:', err);
        this.messages.push({ role: 'assistant', content: 'Désolé, une erreur est survenue lors de la connexion au service IA.' });
        this.isTyping = false;
        this.scrollToBottom();
      }
    });
  }

  private scrollToBottom() {
    setTimeout(() => {
      if (this.scrollContainer) {
        this.scrollContainer.nativeElement.scrollTop = this.scrollContainer.nativeElement.scrollHeight;
      }
    }, 100);
  }
}
