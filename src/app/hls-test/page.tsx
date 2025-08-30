"use client"

import React from 'react'
import { VideoPlayer } from '@/components/ui/video-player'
import { type VideoSource } from '@/lib/api'

// Test HLS sources
const testSources: VideoSource[] = [
  {
    url: 'https://demo.unified-streaming.com/k8s/features/stable/video/tears-of-steel/tears-of-steel.ism/.m3u8',
    quality: '1080p (1920x1080) - HLS Test',
    size: 0
  },
  {
    url: 'https://multiplatform-f.akamaihd.net/i/multi/will/bunny/big_buck_bunny_,640x360_400,640x360_700,640x360_1000,950x540_1500,.f4v.csmil/master.m3u8',
    quality: '720p (1280x720) - HLS Test',
    size: 0
  }
]

export default function HLSTestPage() {
  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">HLS.js Integration Test</h1>
        
        <div className="bg-card rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Test Video Player with HLS Streams</h2>
          <p className="text-muted-foreground mb-6">
            This page tests HLS.js integration with public HLS test streams.
            Check the browser console for HLS.js logs and debug information.
          </p>
          
          <div className="aspect-video max-w-4xl">
            <VideoPlayer
              sources={testSources}
              title="HLS Test Video"
              episodeTitle="Testing HLS.js Integration"
              className="w-full h-full"
            />
          </div>
        </div>

        <div className="bg-card rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4">Debug Information</h3>
          <div className="space-y-2 text-sm font-mono">
            <div>HLS.js Support: <span className="text-green-500">{typeof window !== 'undefined' && 'Hls' in window ? 'Supported' : 'Loading...'}</span></div>
            <div>Test Sources: {testSources.length} HLS streams</div>
            <div>Console: Check browser developer tools for HLS.js logs</div>
          </div>
        </div>
      </div>
    </div>
  )
}
