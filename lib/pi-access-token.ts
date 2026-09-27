"use client";

let accessToken: string | null = null;

export function setPiAccessToken(token: string | null): void {
  accessToken = token?.trim() || null;
}

export function getPiAccessToken(): string | null {
  return accessToken;
}
