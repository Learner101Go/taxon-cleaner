import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'authorFormat' })
export class AuthorFormatPipe implements PipeTransform {
  transform(value: string): string {
    if (!value) return '';

    // Convert "Barkworth, Mary Elizabeth" to "M.E. Barkworth"
    return value
      .split(',')
      .reverse()
      .map((part) => {
        const trimmed = part.trim();
        return trimmed.includes(' ')
          ? trimmed
              .split(' ')
              .map((n) => n[0] + '.')
              .join(' ')
          : trimmed;
      })
      .join(' ');
  }
}
