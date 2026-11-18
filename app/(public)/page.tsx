'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import styled from 'styled-components';
import { ArrowRight, ArrowUp, Check, Heart, HeartPulse, Users, Shield, FileCheck, MessageSquare, Search, FilePlus, CheckSquare, LineChart, Quote, Plus, Minus, Mail, Globe, Sparkles, MapPin, Brain, Activity, Medal, Trophy, HandHeart } from 'lucide-react';
import { Container, Section, SectionHead } from '@/components/ui/Container';
import { Display, H2, Eyebrow, Lead } from '@/components/ui/Typography';
import { LinkButton } from '@/components/ui/Button';
import { Pill } from '@/components/ui/Pill';
import { EmptyState } from '@/components/ui/EmptyState';
import { CauseCard } from '@/components/causes/CauseCard';
import { Reveal } from '@/components/ui/Reveal';
import { CountUp } from '@/components/ui/CountUp';
import { publicApi, type PublicCause, type PublicUpdate, type PublicCategory } from '@/lib/public-api';

const Hero = styled.section`
  position: relative;
  background: linear-gradient(180deg, ${({ theme }) => theme.colors.primary50} 0%, ${({ theme }) => theme.colors.bgWarm} 100%);
  overflow: hidden;
  padding: 80px 0 96px;
  &::before { content: ''; position: absolute; inset: 0; background-image: radial-gradient(circle at 20% 10%, rgba(15,118,110,.08), transparent 50%), radial-gradient(circle at 85% 70%, rgba(217,119,6,.07), transparent 50%); pointer-events: none; }
  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) { padding: 48px 0 56px; }
`;
const HeroGrid = styled.div`
  position: relative;
  display: grid;
  grid-template-columns: 1.1fr 0.9fr;
  gap: 56px;
  align-items: center;
  @media (max-width: ${({ theme }) => theme.breakpoints.lg}) { grid-template-columns: 1fr; gap: 32px; }
`;
const HeroCtas = styled.div` display: flex; gap: 12px; flex-wrap: wrap; margin-top: 28px; `;
const HeroStats = styled.div`
  margin-top: 40px;
  display: flex;
  gap: 32px;
  padding-top: 28px;
  border-top: 1px solid rgba(15, 118, 110, 0.15);
  flex-wrap: wrap;
  .stat .n { font-family: ${({ theme }) => theme.fonts.serif}; font-size: 28px; font-weight: 600; color: ${({ theme }) => theme.colors.primary800}; letter-spacing: -0.01em; }
  .stat .l { font-size: 13px; color: ${({ theme }) => theme.colors.muted}; font-weight: 500; margin-top: 2px; }
  @media (max-width: ${({ theme }) => theme.breakpoints.lg}) {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 10px;
    margin-top: 24px;
    padding-top: 20px;
    .stat {
      background: rgba(255, 255, 255, 0.55);
      border: 1px solid rgba(15, 118, 110, 0.15);
      border-radius: 12px;
      padding: 12px 10px;
      text-align: center;
    }
    .stat .n { font-size: 20px; line-height: 1.1; }
    .stat .l { font-size: 10.5px; line-height: 1.25; margin-top: 4px; }
  }
`;
const HeroVisual = styled.div`
  position: relative;
  min-height: 420px;
  @media (max-width: ${({ theme }) => theme.breakpoints.lg}) { display: none; }
`;
const HeroMobileImg = styled.div`
  display: none;
  @media (max-width: ${({ theme }) => theme.breakpoints.lg}) {
    display: block;
    position: relative;
    height: 340px;
    margin-top: 28px;
    .hmi-back {
      position: absolute; top: 0; left: 0;
      width: 62%; height: 240px;
      border-radius: 16px; overflow: hidden;
      background:
        linear-gradient(180deg, rgba(15,118,110,.18) 0%, rgba(11,31,42,.85) 100%),
        url('/landing/humanitarian.jpg') center/cover no-repeat;
      box-shadow: ${({ theme }) => theme.shadows.md};
      color: #fff;
    }
    .hmi-back .chip {
      position: absolute; left: 14px; right: 14px; bottom: 14px;
      display: flex; flex-direction: column; gap: 4px;
    }
    .hmi-back .tag {
      align-self: flex-start; font-size: 9px; font-weight: 700;
      letter-spacing: .1em; text-transform: uppercase;
      background: rgba(255,255,255,.2); backdrop-filter: blur(4px);
      padding: 4px 9px; border-radius: 999px;
    }
    .hmi-back .ti { font-family: ${({ theme }) => theme.fonts.serif}; font-size: 15px; font-weight: 600; line-height: 1.25; margin-top: 4px; }
    .hmi-back .lo { font-size: 11px; opacity: .88; margin-top: 2px; }
    .hmi-front {
      position: absolute; right: 0; bottom: 0;
      width: 58%;
      background: #fff;
      border-radius: 16px; overflow: hidden;
      border: 1px solid ${({ theme }) => theme.colors.border};
      box-shadow: 0 12px 28px rgba(11,31,42,.18);
    }
    .hmi-front .img {
      height: 118px;
      background: url('/landing/clinic.jpg') center/cover no-repeat;
    }
    .hmi-front .body { padding: 12px 14px 14px; }
    .hmi-front .ti { font-family: ${({ theme }) => theme.fonts.serif}; font-size: 14px; font-weight: 600; color: ${({ theme }) => theme.colors.ink}; line-height: 1.3; }
    .hmi-front .meta { display: flex; align-items: center; gap: 6px; margin-top: 6px; font-size: 11px; color: ${({ theme }) => theme.colors.muted}; }
    .hmi-front .ver { color: ${({ theme }) => theme.colors.primary}; font-weight: 600; display: inline-flex; align-items: center; gap: 3px; }
  }
  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) {
    height: 300px;
    .hmi-back { height: 210px; }
    .hmi-front .img { height: 102px; }
  }
`;
const HvCard = styled.div`
  position: absolute;
  background: #fff;
  border-radius: 16px;
  box-shadow: ${({ theme }) => theme.shadows.md};
  border: 1px solid ${({ theme }) => theme.colors.border};
  padding: 16px;
  &.hv1 { top: 0; left: 0; width: 260px; height: 180px; background: linear-gradient(180deg, rgba(15,118,110,.25) 0%, rgba(11,31,42,.88) 100%), url('/landing/humanitarian.jpg') center/cover no-repeat; color: #fff; padding: 20px; display: flex; flex-direction: column; justify-content: space-between; border: none; }
  &.hv2 { top: 40px; right: 0; width: 280px; }
  &.hv3 { bottom: 0; left: 60px; width: 300px; display: flex; align-items: center; gap: 12px; }
`;
const CauseGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
  @media (max-width: ${({ theme }) => theme.breakpoints.lg}) { grid-template-columns: repeat(2, 1fr); }
  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) { grid-template-columns: repeat(2, 1fr); gap: 12px; }
`;
const CatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 16px;
  @media (max-width: ${({ theme }) => theme.breakpoints.lg}) { grid-template-columns: repeat(4, 1fr); }
  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) { grid-template-columns: repeat(2, 1fr); }
`;
const CatCard = styled(Link)`
  padding: 24px 16px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  text-align: center;
  background: #fff;
  text-decoration: none;
  transition: all 0.15s;
  &:hover { border-color: ${({ theme }) => theme.colors.primary}; background: ${({ theme }) => theme.colors.primary50}; }
  .ic { width: 52px; height: 52px; border-radius: 12px; background: ${({ theme }) => theme.colors.primary50}; color: ${({ theme }) => theme.colors.primary700}; display: grid; place-items: center; }
  &:hover .ic { background: ${({ theme }) => theme.colors.primary}; color: #fff; }
  .nm { font-size: 14px; font-weight: 600; color: ${({ theme }) => theme.colors.ink}; }
  .cn { font-size: 12px; color: ${({ theme }) => theme.colors.muted}; }
`;
const HowGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 24px;
  margin-top: 40px;
  @media (max-width: ${({ theme }) => theme.breakpoints.lg}) { grid-template-columns: repeat(2, 1fr); }
  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) { grid-template-columns: 1fr; }
`;
const HowStep = styled.div`
  background: #fff;
  padding: 28px;
  border-radius: 14px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  .ic { width: 48px; height: 48px; border-radius: 10px; background: ${({ theme }) => theme.colors.primary50}; color: ${({ theme }) => theme.colors.primary700}; display: grid; place-items: center; margin-bottom: 16px; }
  .nu { font-family: ${({ theme }) => theme.fonts.serif}; font-size: 14px; font-weight: 600; color: ${({ theme }) => theme.colors.primary}; margin-bottom: 10px; }
  h4 { font-family: ${({ theme }) => theme.fonts.serif}; font-size: 19px; font-weight: 600; color: ${({ theme }) => theme.colors.ink}; margin: 0 0 10px; }
  p { font-size: 14px; color: ${({ theme }) => theme.colors.muted}; margin: 0; line-height: 1.55; }
`;
const ImpactGrid = styled.div`
  display: grid;
  grid-template-columns: 1.2fr 1fr;
  gap: 56px;
  align-items: flex-start;
  @media (max-width: ${({ theme }) => theme.breakpoints.lg}) { grid-template-columns: 1fr; gap: 32px; }
`;
const MetricsGrid = styled.div` display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; margin-top: 24px; `;
const IMetric = styled.div`
  background: #fff;
  padding: 24px;
  border-radius: 14px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  .n { font-family: ${({ theme }) => theme.fonts.serif}; font-size: 36px; font-weight: 600; color: ${({ theme }) => theme.colors.primary800}; letter-spacing: -0.02em; line-height: 1; }
  .l { font-size: 13px; color: ${({ theme }) => theme.colors.muted}; margin-top: 8px; font-weight: 500; }
  .d { display: inline-flex; align-items: center; gap: 4px; font-size: 12px; color: ${({ theme }) => theme.colors.success}; font-weight: 600; margin-top: 6px; }
`;
const UpdateFeed = styled.div`
  display: flex;
  flex-direction: column;
  gap: 14px;
  margin-top: 16px;
  .upd { background: #fff; padding: 18px; border-radius: 12px; border: 1px solid ${({ theme }) => theme.colors.border}; display: flex; gap: 14px; }
  .dot { width: 40px; height: 40px; border-radius: 10px; background: ${({ theme }) => theme.colors.primary100}; color: ${({ theme }) => theme.colors.primary800}; display: grid; place-items: center; flex-shrink: 0; }
  .h { font-size: 14px; font-weight: 600; color: ${({ theme }) => theme.colors.ink}; }
  .m { font-size: 13px; color: ${({ theme }) => theme.colors.muted}; margin-top: 4px; line-height: 1.5; }
  .t { font-size: 11px; color: ${({ theme }) => theme.colors.muted2}; margin-top: 6px; font-weight: 500; }
`;
const OrgCtaCard = styled.div`
  background: #fff;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 20px;
  padding: 56px;
  display: grid;
  grid-template-columns: 1.4fr 1fr;
  gap: 40px;
  align-items: center;
  @media (max-width: ${({ theme }) => theme.breakpoints.lg}) { grid-template-columns: 1fr; padding: 32px; gap: 28px; }
  ul { list-style: none; padding: 0; margin: 0 0 24px; display: flex; flex-direction: column; gap: 10px; }
  li { display: flex; align-items: flex-start; gap: 10px; font-size: 15px; color: ${({ theme }) => theme.colors.text}; }
  li svg { color: ${({ theme }) => theme.colors.primary}; flex-shrink: 0; margin-top: 3px; }
`;
const StepsVisual = styled.div`
  background: linear-gradient(135deg, ${({ theme }) => theme.colors.primary50}, ${({ theme }) => theme.colors.accent50});
  border-radius: 14px;
  padding: 32px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  .mini { background: #fff; border-radius: 10px; padding: 16px; border: 1px solid ${({ theme }) => theme.colors.border}; box-shadow: ${({ theme }) => theme.shadows.sm}; }
  .mini.active { border-color: ${({ theme }) => theme.colors.primary}; box-shadow: 0 0 0 3px rgba(15,118,110,.1); }
  .l { font-size: 11px; font-weight: 600; color: ${({ theme }) => theme.colors.muted}; text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 4px; }
  .v { font-size: 14px; color: ${({ theme }) => theme.colors.ink}; font-weight: 500; }
`;
const Trust = styled(Section)`
  background: linear-gradient(180deg, ${({ theme }) => theme.colors.primary800} 0%, ${({ theme }) => theme.colors.primary700} 100%);
  color: #fff;
  h2 { color: #fff; }
  p { color: rgba(255,255,255,.85); }
`;
const TrustCols = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 28px;
  margin-top: 40px;
  @media (max-width: ${({ theme }) => theme.breakpoints.lg}) { grid-template-columns: 1fr; }
`;
const TrustCol = styled.div`
  padding: 28px;
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.07);
  backdrop-filter: blur(8px);
  border: 1px solid rgba(255, 255, 255, 0.12);
  .ic { width: 48px; height: 48px; border-radius: 10px; background: rgba(255, 255, 255, 0.15); display: grid; place-items: center; margin-bottom: 16px; }
  h4 { font-family: ${({ theme }) => theme.fonts.serif}; font-size: 19px; font-weight: 600; margin: 0 0 10px; color: #fff; }
  p { color: rgba(255, 255, 255, 0.78); font-size: 14px; line-height: 1.55; margin: 0; }
`;

const Gallery = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr 1fr;
  grid-template-rows: 220px 220px;
  gap: 16px;
  margin-top: 40px;
  @media (max-width: ${({ theme }) => theme.breakpoints.lg}) { grid-template-columns: 1fr 1fr; grid-template-rows: 200px 200px 200px; }
  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) {
    grid-template-columns: 1fr 1fr;
    grid-template-rows: none;
    grid-auto-rows: 170px;
    gap: 12px;
  }
`;
const Tile = styled.div<{ $img: string; $span?: string; $tint?: string }>`
  position: relative;
  border-radius: 16px;
  overflow: hidden;
  background: #0b1f2a url(${(p) => p.$img}) center/cover no-repeat;
  grid-column: ${(p) => p.$span || 'auto'};
  grid-row: ${(p) => (p.$span === '1 / span 1 / 1 / span 2' ? 'span 2' : 'auto')};
  box-shadow: ${({ theme }) => theme.shadows.sm};
  transition: transform .25s ease, box-shadow .25s ease;
  &::after { content:''; position:absolute; inset:0; background: linear-gradient(180deg, rgba(0,0,0,0) 35%, rgba(0,0,0,.78) 100%); }
  &:hover { transform: translateY(-4px); box-shadow: ${({ theme }) => theme.shadows.md}; }
  .tag-ic {
    position: absolute; top: 14px; left: 14px; z-index: 2;
    display: inline-flex; align-items: center; gap: 6px;
    background: ${(p) => p.$tint || 'rgba(15,118,110,.95)'};
    color: #fff; font-size: 10px; font-weight: 700;
    letter-spacing: .08em; text-transform: uppercase;
    padding: 5px 10px 5px 6px; border-radius: 999px;
    box-shadow: 0 2px 6px rgba(0,0,0,.2);
    svg { width: 14px; height: 14px; background: rgba(255,255,255,.2); border-radius: 999px; padding: 2px; }
  }
  .label { position: absolute; left: 16px; right: 16px; bottom: 14px; z-index: 1; color:#fff; padding-right: 48px; }
  h4 { font-family: ${({ theme }) => theme.fonts.serif}; font-size: 18px; margin: 0 0 6px; font-weight: 600; line-height: 1.25; }
  .loc { display: inline-flex; align-items: flex-start; gap: 4px; font-size: 12px; color: rgba(255,255,255,.9); margin: 0; line-height: 1.35; svg { width: 12px; height: 12px; margin-top: 3px; flex: 0 0 auto; } }
  .arrow {
    position: absolute; right: 14px; bottom: 14px; z-index: 2;
    width: 34px; height: 34px; border-radius: 999px;
    background: #fff; color: #0b1f2a;
    display: grid; place-items: center;
    box-shadow: 0 4px 10px rgba(0,0,0,.25);
    svg { width: 16px; height: 16px; }
  }
  &.wide {
    grid-column: span 1; grid-row: span 2;
    h4 { font-size: 22px; }
    @media (max-width: ${({ theme }) => theme.breakpoints.lg}) { grid-column: 1 / -1; grid-row: span 1; }
    @media (max-width: ${({ theme }) => theme.breakpoints.sm}) { grid-column: 1 / -1; grid-row: span 1; }
  }
  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) {
    h4 { font-size: 14px; margin-bottom: 4px; }
    &.wide h4 { font-size: 16px; }
    .loc { font-size: 11px; }
    .tag-ic { font-size: 9px; padding: 4px 8px 4px 5px; svg { width: 12px; height: 12px; } }
    .arrow { width: 28px; height: 28px; svg { width: 13px; height: 13px; } }
    .label { padding-right: 40px; left: 12px; right: 12px; bottom: 12px; }
  }
`;

const StoriesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 24px;
  margin-top: 40px;
  max-width: 900px;
  @media (max-width: ${({ theme }) => theme.breakpoints.lg}) { grid-template-columns: 1fr; }
  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) {
    grid-template-columns: 1fr 1fr;
    gap: 12px;
    > * .img { height: 110px; }
    > * .body { padding: 12px; gap: 8px; }
    > * .qi { width: 28px; height: 28px; border-radius: 8px; svg { width: 14px; height: 14px; } }
    > * blockquote {
      font-size: 12.5px;
      line-height: 1.45;
      font-style: normal;
      display: -webkit-box;
      -webkit-line-clamp: 5;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
    > * .meta { padding-top: 10px; gap: 8px; }
    > * .avatar { width: 32px; height: 32px; font-size: 12px; }
    > * .who .nm { font-size: 12px; }
    > * .who .ro { font-size: 11px; }
  }
`;
const StoryCard = styled.article`
  background: #fff;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 16px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  transition: transform .2s ease, box-shadow .2s ease;
  &:hover { transform: translateY(-3px); box-shadow: ${({ theme }) => theme.shadows.md}; }
  .img { height: 220px; background-size: cover; background-position: center; }
  .body { padding: 24px; display: flex; flex-direction: column; gap: 12px; flex: 1; }
  .qi { width: 36px; height: 36px; border-radius: 10px; background: ${({ theme }) => theme.colors.primary50}; color: ${({ theme }) => theme.colors.primary700}; display: grid; place-items: center; }
  blockquote { font-family: ${({ theme }) => theme.fonts.serif}; font-size: 17px; line-height: 1.55; color: ${({ theme }) => theme.colors.ink}; margin: 0; font-style: italic; }
  .meta { display: flex; align-items: center; gap: 10px; margin-top: auto; padding-top: 12px; border-top: 1px dashed ${({ theme }) => theme.colors.border}; }
  .avatar { width: 40px; height: 40px; border-radius: 999px; background: linear-gradient(135deg,#0F766E,#115E59); color: #fff; display: grid; place-items: center; font-weight: 700; font-size: 14px; }
  .who .nm { font-size: 14px; font-weight: 600; color: ${({ theme }) => theme.colors.ink}; }
  .who .ro { font-size: 12px; color: ${({ theme }) => theme.colors.muted}; margin-top: 2px; }
  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) {
    .img { height: 110px; }
    .body { padding: 12px; gap: 8px; }
    .qi { width: 26px; height: 26px; border-radius: 8px; svg { width: 13px; height: 13px; } }
    blockquote {
      font-size: 12.5px;
      line-height: 1.45;
      font-style: normal;
      display: -webkit-box;
      -webkit-line-clamp: 5;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
    .meta { padding-top: 10px; gap: 8px; }
    .avatar { width: 30px; height: 30px; font-size: 11px; }
    .who .nm { font-size: 12px; }
    .who .ro { font-size: 10.5px; }
  }
`;

const FieldGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  margin-top: 40px;
  @media (max-width: ${({ theme }) => theme.breakpoints.lg}) { grid-template-columns: repeat(2, 1fr); }
  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) {
    grid-template-columns: 1fr 1fr;
    gap: 12px;
    > * .img { height: 130px; }
  }
`;
const FieldCard = styled.article`
  background: #fff;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 14px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  transition: transform .2s ease, box-shadow .2s ease;
  &:hover { transform: translateY(-3px); box-shadow: ${({ theme }) => theme.shadows.md}; }
  .img { height: 160px; background-size: cover; background-position: center; }
  .b { padding: 18px 18px 20px; display: flex; flex-direction: column; gap: 8px; flex: 1; }
  .tag { font-size: 11px; font-weight: 700; letter-spacing:.08em; text-transform: uppercase; color: ${({ theme }) => theme.colors.primary700}; }
  h4 { font-family: ${({ theme }) => theme.fonts.serif}; font-size: 17px; margin: 2px 0 4px; font-weight: 600; color: ${({ theme }) => theme.colors.ink}; line-height: 1.3; }
  p { font-size: 13px; color: ${({ theme }) => theme.colors.muted}; margin: 0; line-height: 1.5; }
  .pl { font-size: 12px; color: ${({ theme }) => theme.colors.muted2}; margin-top: auto; padding-top: 10px; display:inline-flex; align-items:center; gap:6px; }
  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) {
    .img { height: 110px; }
    .b { padding: 12px 12px 14px; gap: 6px; }
    .tag { font-size: 9.5px; letter-spacing: .06em; }
    h4 { font-size: 13.5px; line-height: 1.25; }
    p {
      font-size: 11.5px;
      line-height: 1.4;
      display: -webkit-box;
      -webkit-line-clamp: 3;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
    .pl { font-size: 11px; padding-top: 6px; svg { width: 12px; height: 12px; } }
  }
`;

const FaqList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 36px;
  max-width: 820px;
  margin-left: auto;
  margin-right: auto;
`;
const FaqItem = styled.div<{ $open: boolean }>`
  background: #fff;
  border: 1px solid ${({ theme, $open }) => ($open ? theme.colors.primary : theme.colors.border)};
  border-radius: 14px;
  overflow: hidden;
  transition: border-color .2s;
  button { width: 100%; background: transparent; border: 0; padding: 20px 24px; display: flex; justify-content: space-between; align-items: center; cursor: pointer; text-align: left; font-family: inherit; }
  button .q { font-size: 16px; font-weight: 600; color: ${({ theme }) => theme.colors.ink}; }
  button .ic { width: 32px; height: 32px; border-radius: 8px; background: ${({ theme, $open }) => ($open ? theme.colors.primary : theme.colors.primary50)}; color: ${({ theme, $open }) => ($open ? '#fff' : theme.colors.primary700)}; display: grid; place-items: center; flex-shrink: 0; margin-left: 16px; }
  .ans { max-height: ${(p) => (p.$open ? '400px' : '0')}; opacity: ${(p) => (p.$open ? 1 : 0)}; padding: ${(p) => (p.$open ? '0 24px 22px' : '0 24px')}; transition: max-height .25s ease, opacity .25s ease, padding .25s ease; font-size: 15px; color: ${({ theme }) => theme.colors.text}; line-height: 1.6; }
`;

const Newsletter = styled.div`
  background: linear-gradient(135deg, #0F766E 0%, #134E4A 100%);
  color: #fff;
  border-radius: 20px;
  padding: 48px 56px;
  display: grid;
  grid-template-columns: 1.3fr 1fr;
  gap: 32px;
  align-items: center;
  position: relative;
  overflow: hidden;
  &::before { content:''; position:absolute; right: -80px; top:-80px; width: 320px; height: 320px; border-radius: 999px; background: radial-gradient(circle, rgba(217,119,6,.22), transparent 70%); pointer-events: none; }
  h3 { font-family: ${({ theme }) => theme.fonts.serif}; font-size: 28px; font-weight: 600; margin: 10px 0 10px; color: #fff; line-height: 1.2; }
  p { color: rgba(255,255,255,.85); font-size: 15px; margin: 0; max-width: 46ch; line-height: 1.55; }
  @media (max-width: ${({ theme }) => theme.breakpoints.lg}) { grid-template-columns: minmax(0, 1fr); padding: 32px; }
  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) { padding: 28px 20px; gap: 20px; h3 { font-size: 22px; } p { font-size: 14px; } }
`;
const NlForm = styled.form`
  display: flex;
  gap: 10px;
  background: rgba(255,255,255,.08);
  padding: 8px;
  border-radius: 14px;
  border: 1px solid rgba(255,255,255,.18);
  backdrop-filter: blur(6px);
  input { flex: 1; min-width: 0; background: transparent; border: 0; outline: 0; color: #fff; padding: 10px 14px; font-size: 15px; font-family: inherit; &::placeholder { color: rgba(255,255,255,.65); } }
  button { background: #D97706; color: #fff; border: 0; padding: 10px 18px; border-radius: 10px; font-weight: 600; font-size: 14px; cursor: pointer; display:inline-flex; align-items:center; justify-content: center; gap:6px; transition: background .15s; white-space: nowrap; &:hover { background: #B45309; } }
  .note { font-size: 12px; color: rgba(255,255,255,.7); margin-top: 10px; display: block; }
  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) {
    flex-direction: column;
    gap: 8px;
    input { padding: 12px 14px; }
    button { width: 100%; padding: 12px 18px; }
  }
`;
const NlWrap = styled.div`
  display: flex; flex-direction: column; gap: 10px;
`;

const Partners = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 24px;
  margin-top: 32px;
  @media (max-width: ${({ theme }) => theme.breakpoints.lg}) { grid-template-columns: repeat(2, 1fr); }
`;
const PartnerPill = styled.div`
  background: #fff;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 12px;
  padding: 18px 20px;
  display: flex; align-items: center; gap: 12px;
  .lg { width: 40px; height: 40px; border-radius: 10px; display:grid; place-items:center; color:#fff; font-family: ${({ theme }) => theme.fonts.serif}; font-weight: 700; }
  .t { font-size: 14px; font-weight: 600; color: ${({ theme }) => theme.colors.ink}; }
  .s { font-size: 12px; color: ${({ theme }) => theme.colors.muted}; margin-top: 2px; }
`;

const GALLERY = [
  { img: '/landing/2.jpg', tag: 'Orphanages & foster care', title: 'Children at community-run orphanages', place: 'The kind of work you will find here', icon: HandHeart, tint: 'rgba(37,99,235,.95)' },
  { img: '/landing/3.jpg', tag: 'Mental health', title: 'Peer support that listens', place: 'Community-led, independently reviewed', icon: Brain, tint: 'rgba(16,185,129,.95)' },
  { img: '/landing/5.jpg', tag: 'Community health', title: 'Mobile outreach and clinic programs', place: 'The kind of work you will find here', icon: Activity, tint: 'rgba(139,92,246,.95)' },
  { img: '/landing/1.jpg', tag: 'Veterans', title: 'Adaptive sports and transition support', place: 'Community-led, independently reviewed', icon: Medal, tint: 'rgba(234,88,12,.95)' },
  { img: '/landing/4.jpg', tag: 'Adaptive programs', title: 'Youth sport and after-school leagues', place: 'The kind of work you will find here', icon: Trophy, tint: 'rgba(14,165,164,.95)' },
];

const FIELD = [
  { img: '/landing/clinic.jpg', tag: 'Healthcare', title: 'Rural clinic staffing drives', copy: 'Causes supporting frontline nurses, equipment and patient transport.', place: 'Community-led healthcare' },
  { img: '/landing/classroom.jpg', tag: 'Education', title: 'Classroom supply programs', copy: 'Textbooks, materials and repairs for underfunded schools.', place: 'Community-led education' },
  { img: '/landing/diverse.jpg', tag: 'Community', title: 'Weekend meal programs', copy: 'Hot meals and tutoring support for children and families.', place: 'Community-led food security' },
  { img: '/landing/community-group.jpg', tag: 'Partnerships', title: 'Neighborhood volunteer cohorts', copy: 'Safeguarding and first-aid training for new volunteers.', place: 'Community-led training' },
];

const STORIES = [
  { img: '/landing/5.jpg', quote: 'Every cause is reviewed privately by trained reviewers before anyone sees it on the public site — no self-publishing, no shortcuts.', name: 'Independent review', role: 'How publication works' },
  { img: '/landing/2.jpg', quote: 'Supporting documents stay private with reviewers. Nothing identifying children, patients or families ever appears on a public profile.', name: 'Dignity by design', role: 'How privacy works' },
];

const FAQS = [
  { q: 'How is a cause verified before it is published?', a: 'Every submission is reviewed privately by trained reviewers using a documented checklist covering legitimacy, scope, budget and safeguarding. Only approved causes appear publicly, and decisions are recorded in an audit trail.' },
  { q: 'Who can submit an organization?', a: 'Any humanitarian organization — formal or community-based — can register. We verify legal standing or community references for smaller organizations, and keep supporting documents private.' },
  { q: 'Does Meeting Global Needs process donations?', a: 'Not directly. We focus on discovery and verification. Supporters are directed to each organization\'s own vetted channels, keeping funds in the hands of the people doing the work.' },
  { q: 'Can supporters see progress after a cause is funded?', a: 'Yes. Organizations post progress updates that go through the same review process. You see verified outcomes and honest setbacks — not polished promises.' },
  { q: 'How do you protect privacy of the people being served?', a: 'Beneficiary-identifying information is scrubbed from public listings. Only aggregate or anonymized details appear; reviewers block anything that could expose a child, patient or family.' },
  { q: 'Is the platform free for organizations to use?', a: 'Yes. Listing, verification and progress updates are free. We invest in the review team so the public listings stay trustworthy.' },
];

const PARTNERS = [
  { n: 'Horizon Health', s: 'Regional network', c: 'linear-gradient(135deg,#0F766E,#115E59)' },
  { n: 'Kindred Foundation', s: 'Grant partner', c: 'linear-gradient(135deg,#D97706,#B45309)' },
  { n: 'Open Court Initiative', s: 'Program collaborator', c: 'linear-gradient(135deg,#6366F1,#4338CA)' },
  { n: 'Still Waters Collective', s: 'Field reviewer', c: 'linear-gradient(135deg,#0891B2,#0E7490)' },
];

const CAT_ICONS: Record<string, any> = {
  orphanages: Heart,
  'foster-care': Users,
  cancer: HeartPulse,
  diabetes: LineChart,
  'mental-health': Users,
  veterans: Shield,
  other: Heart,
};

function relativeTime(iso: string | null): string {
  if (!iso) return '';
  const ms = Date.now() - new Date(iso).getTime();
  const h = Math.max(1, Math.round(ms / 3600e3));
  if (h < 48) return `${h}h ago`;
  const d = Math.round(ms / 86400e3);
  if (d < 14) return `${d}d ago`;
  return `${Math.round(d / 7)}w ago`;
}

export default function HomePage() {
  const [featured, setFeatured] = useState<PublicCause[]>([]);
  const [cats, setCats] = useState<PublicCategory[]>([]);
  const [updates, setUpdates] = useState<PublicUpdate[]>([]);
  const [stats, setStats] = useState<{ publishedCauses: number; verifiedOrgs: number; approvedUpdates: number; categories: number } | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [openFaq, setOpenFaq] = useState<number>(0);
  const [nlEmail, setNlEmail] = useState('');
  const [nlState, setNlState] = useState<'idle' | 'sending' | 'ok' | 'error'>('idle');
  const [nlMsg, setNlMsg] = useState('We respect your inbox. Unsubscribe anytime.');

  useEffect(() => {
    Promise.all([
      publicApi.featuredCauses(6).catch(() => []),
      publicApi.categories().catch(() => []),
      publicApi.listUpdates({ limit: 3 }).catch(() => ({ items: [] as PublicUpdate[] } as any)),
      publicApi.stats().catch(() => null),
    ]).then(([f, c, u, s]: any[]) => {
      setFeatured(f);
      setCats(c);
      setUpdates(u.items || []);
      setStats(s);
      setLoaded(true);
    });
  }, []);

  return (
    <>
      <Hero>
        <Container>
          <HeroGrid>
            <Reveal as="div">
              <Pill $tone="primary">
                <span style={{ width: 6, height: 6, borderRadius: 999, background: '#0F766E', display: 'inline-block' }} />
                Trusted humanitarian platform
              </Pill>
              <Display style={{ marginTop: 18 }}>
                Where verified needs
                <br />
                meet <em style={{ fontStyle: 'normal', color: '#115E59' }}>compassionate action.</em>
              </Display>
              <Lead style={{ marginTop: 20}}>
                Meeting Global Needs connects communities, humanitarian organizations and supporters
                through transparent, independently reviewed causes — so help reaches where it's
                needed, dignity intact.
              </Lead>
              <HeroCtas>
                <LinkButton as={Link} href="/causes" $variant="primary" $size="lg">
                  Explore causes <ArrowRight size={16} />
                </LinkButton>
                <LinkButton as={Link} href="/register" $variant="ghost" $size="lg">
                  Submit your organization
                </LinkButton>
              </HeroCtas>
              <HeroStats>
                <div className="stat"><div className="n"><CountUp value={stats?.categories ?? cats.length ?? 7} /></div><div className="l">Humanitarian categories</div></div>
                <div className="stat"><div className="n">3-step</div><div className="l">Independent verification</div></div>
                <div className="stat"><div className="n"><CountUp value={100} suffix="%" /></div><div className="l">Transparent review process</div></div>
              </HeroStats>
              <HeroMobileImg aria-hidden="true">
                <div className="hmi-back">
                  <div className="chip">
                    <span className="tag">Humanitarian causes</span>
                    <span className="ti">Verified needs, published only after independent review</span>
                    <span className="lo">Submitted by approved organizations</span>
                  </div>
                </div>
                <div className="hmi-front">
                  <div className="img" />
                  <div className="body">
                    <div className="ti">Independently reviewed causes</div>
                    <div className="meta">
                      <span className="ver">✓ Verified</span>
                      <span>· Approved organizations</span>
                    </div>
                  </div>
                </div>
              </HeroMobileImg>
            </Reveal>
            <HeroVisual aria-hidden="true">
              <HvCard className="hv1">
                <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.1em', opacity: 0.85, textTransform: 'uppercase' }}>Humanitarian causes</span>
                <span style={{ fontFamily: 'Lora, serif', fontSize: 18, fontWeight: 600, lineHeight: 1.3 }}>Verified needs, published only after independent review</span>
                <span style={{ fontSize: 12, opacity: 0.9 }}>Submitted by approved organizations</span>
              </HvCard>
              <HvCard className="hv2">
                <div style={{ height: 140, borderRadius: 10, backgroundImage: "url('/landing/healthcare.jpg')", backgroundSize: 'cover', backgroundPosition: 'center', margin: '-16px -16px 14px' }} />
                <div style={{ fontFamily: 'Lora, serif', fontSize: 16, fontWeight: 600, color: '#0B1F2A' }}>Independently reviewed causes</div>
                <div style={{ fontSize: 12, color: '#64748B', marginTop: 4, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                  <Check size={12} color="#15803D" strokeWidth={3} />
                  <span style={{ color: '#15803D', fontWeight: 600 }}>Verified</span> · Approved organizations only
                </div>
              </HvCard>
              <HvCard className="hv3">
                <div style={{ width: 44, height: 44, borderRadius: 10, background: 'linear-gradient(135deg,#BEF264,#65A30D)', display: 'grid', placeItems: 'center', color: '#fff', fontWeight: 700 }}>M</div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: '#0B1F2A' }}>Progress update approved</div>
                  <div style={{ fontSize: 12, color: '#64748B', marginTop: 2 }}>Reviewer-signed · Published publicly</div>
                </div>
              </HvCard>
            </HeroVisual>
          </HeroGrid>
        </Container>
      </Hero>

      <Section $bg="bg">
        <Container>
          <SectionHead>
            <div>
              <Eyebrow>Featured Causes</Eyebrow>
              <H2 style={{ marginTop: 10, marginBottom: 12 }}>Verified needs seeking support</H2>
              <Lead>
                Every cause here has been submitted by an approved organization and independently
                reviewed before publication.
              </Lead>
            </div>
            <LinkButton as={Link} href="/causes" $variant="ghost" $size="md">
              View all causes <ArrowRight size={14} />
            </LinkButton>
          </SectionHead>
          {loaded && featured.length === 0 ? (
            <EmptyState
              icon={<Heart size={26} />}
              title="Our first causes are on the way"
              body="We're onboarding our founding partner organizations and verifying their work. Approved causes will appear here as they're published."
              primaryHref="/register?role=org"
              primaryLabel="Submit your organization"
            />
          ) : (
            <Reveal as={CauseGrid} delay={120}>
              {featured.map((c) => (
                <CauseCard
                  key={c.id}
                  cause={{
                    slug: c.slug,
                    gradient: c.gradient,
                    title: c.title,
                    category: c.category as any,
                    shortDescription: c.shortDescription,
                    organization: {
                      name: c.organization?.name || 'Organization',
                      verified: !!c.organization?.verified,
                    } as any,
                  } as any}
                />
              ))}
              {featured.length === 0 && (
                <div style={{ gridColumn: '1 / -1', padding: 40, textAlign: 'center', color: '#64748B' }}>
                  Loading featured causes…
                </div>
              )}
            </Reveal>
          )}
        </Container>
      </Section>

      <Section $bg="surface">
        <Container>
          <SectionHead>
            <div>
              <Eyebrow>Browse by Category</Eyebrow>
              <H2 style={{ marginTop: 10 }}>Find causes that resonate with you</H2>
            </div>
          </SectionHead>
          <Reveal as={CatsGrid} delay={120}>
            {cats.map((c) => {
              const Icon = CAT_ICONS[c.slug] || Heart;
              return (
                <CatCard key={c.slug} href={`/causes?category=${c.slug}`}>
                  <span className="ic"><Icon size={24} /></span>
                  <span className="nm">{c.name}</span>
                  <span className="cn">{c.causeCount} cause{c.causeCount === 1 ? '' : 's'}</span>
                </CatCard>
              );
            })}
          </Reveal>
        </Container>
      </Section>

      <Section $bg="bg">
        <Container>
          <SectionHead>
            <div>
              <Eyebrow>Who your support reaches</Eyebrow>
              <H2 style={{ marginTop: 10, marginBottom: 12 }}>Real people. Real programs. Reviewed before you ever see them.</H2>
              <Lead>
                A glimpse of the communities, patients, children and veterans our verified organizations
                serve every week — captured with permission, never identifying anyone by name.
              </Lead>
            </div>
            <LinkButton as={Link} href="/causes" $variant="ghost" $size="md">
              See every verified cause <ArrowRight size={14} />
            </LinkButton>
          </SectionHead>
          <Reveal as={Gallery} delay={120}>
            {GALLERY.map((g, i) => {
              const Ic = g.icon;
              return (
                <Tile key={g.img} $img={g.img} $tint={g.tint} className={i === 0 ? 'wide' : ''}>
                  <span className="tag-ic"><Ic /> {g.tag}</span>
                  <div className="label">
                    <h4>{g.title}</h4>
                    <span className="loc"><MapPin /> {g.place}</span>
                  </div>
                  <span className="arrow"><ArrowRight /></span>
                </Tile>
              );
            })}
          </Reveal>
        </Container>
      </Section>

      <Section $bg="warm">
        <Container>
          <SectionHead style={{ justifyContent: 'center', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
            <div>
              <Eyebrow>How it works</Eyebrow>
              <H2 style={{ marginTop: 10, marginBottom: 12 }}>A transparent path from need to action</H2>
              <Lead style={{ textAlign: 'center' }}>
                Every cause on Meeting Global Needs passes through a four-step process designed to
                protect supporters and preserve dignity for those being served.
              </Lead>
            </div>
          </SectionHead>
          <Reveal as={HowGrid} delay={120}>
            <HowStep><div className="ic"><Search size={22} /></div><div className="nu">Step 01</div><h4>Discover</h4><p>Visitors explore published humanitarian causes by category, region, or organization — every listing clearly marked as independently reviewed.</p></HowStep>
            <HowStep><div className="ic"><FilePlus size={22} /></div><div className="nu">Step 02</div><h4>Submit</h4><p>Approved organizations complete a multi-step submission with supporting documents, intended use, and clear impact goals.</p></HowStep>
            <HowStep><div className="ic"><CheckSquare size={22} /></div><div className="nu">Step 03</div><h4>Verify &amp; publish</h4><p>Independent reviewers inspect submissions privately, request changes where needed, and only approved causes appear publicly.</p></HowStep>
            <HowStep><div className="ic"><LineChart size={22} /></div><div className="nu">Step 04</div><h4>Track &amp; communicate</h4><p>Organizations post approved progress updates and respond to inquiries — supporters follow real outcomes, not promises.</p></HowStep>
          </Reveal>
        </Container>
      </Section>

      <Section $bg="bg">
        <Container>
          <ImpactGrid>
            <div>
              <Eyebrow>Impact &amp; transparency</Eyebrow>
              <H2 style={{ marginTop: 10, marginBottom: 12 }}>Progress worth tracking, honestly</H2>
              <Lead>
                We never publish fabricated outcomes. Metrics below reflect only platform activity we
                can verify from our own records; organization-reported outcomes appear separately
                with clear attribution.
              </Lead>
              <MetricsGrid>
                <IMetric><div className="n"><CountUp value={stats?.publishedCauses ?? 0} /></div><div className="l">Causes published</div><div className="d"><ArrowUp size={12} />Verified count</div></IMetric>
                <IMetric><div className="n"><CountUp value={stats?.categories ?? 7} /></div><div className="l">Humanitarian categories</div></IMetric>
                <IMetric><div className="n"><CountUp value={100} suffix="%" /></div><div className="l">Reviewed before publication</div></IMetric>
                <IMetric><div className="n"><CountUp value={stats?.verifiedOrgs ?? 0} /></div><div className="l">Verified organizations</div></IMetric>
              </MetricsGrid>
            </div>
            <div>
              <Eyebrow>Latest approved updates</Eyebrow>
              <UpdateFeed>
                {updates.map((u, i) => {
                  const Icon = [Heart, Shield, CheckSquare][i] ?? Heart;
                  return (
                    <div className="upd" key={u.id}>
                      <div className="dot"><Icon size={18} /></div>
                      <div>
                        <div className="h">{u.title}</div>
                        <div className="m">{u.body}</div>
                        <div className="t">Approved {relativeTime(u.approvedAt)}</div>
                      </div>
                    </div>
                  );
                })}
                {loaded && updates.length === 0 && (
                  <div style={{ padding: 20, textAlign: 'center', color: '#64748B', fontSize: 13, border: '1px dashed #E2E8F0', borderRadius: 10 }}>
                    No approved updates yet. Verified organizations will post progress updates here as their work gets reviewer sign-off.
                  </div>
                )}
              </UpdateFeed>
            </div>
          </ImpactGrid>
        </Container>
      </Section>

      <Section $bg="surface">
        <Container>
          <SectionHead style={{ justifyContent: 'center', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
            <div>
              <Eyebrow>What we stand for</Eyebrow>
              <H2 style={{ marginTop: 10, marginBottom: 12 }}>Why organizations and supporters choose this platform</H2>
              <Lead style={{ textAlign: 'center' }}>
                The principles behind every cause you see here — independent review, protected
                beneficiaries, and honest progress updates.
              </Lead>
            </div>
          </SectionHead>
          <Reveal as={StoriesGrid} delay={120}>
            {STORIES.map((s) => (
              <StoryCard key={s.name}>
                <div className="img" style={{ backgroundImage: `url(${s.img})` }} />
                <div className="body">
                  <div className="qi"><Quote size={18} /></div>
                  <blockquote>&ldquo;{s.quote}&rdquo;</blockquote>
                  <div className="meta">
                    <div className="avatar">{s.name.split(' ').map((p) => p[0]).slice(0, 2).join('')}</div>
                    <div className="who">
                      <div className="nm">{s.name}</div>
                      <div className="ro">{s.role}</div>
                    </div>
                  </div>
                </div>
              </StoryCard>
            ))}
          </Reveal>
        </Container>
      </Section>

      <Section $bg="warm">
        <Container>
          <SectionHead>
            <div>
              <Eyebrow>In the field this month</Eyebrow>
              <H2 style={{ marginTop: 10, marginBottom: 12 }}>Fresh approved work from verified organizations</H2>
              <Lead>
                Snapshots of causes making measurable progress right now — each tied to a published
                cause and recent reviewer-approved update.
              </Lead>
            </div>
            <LinkButton as={Link} href="/impact" $variant="ghost" $size="md">
              See full impact report <ArrowRight size={14} />
            </LinkButton>
          </SectionHead>
          <FieldGrid>
            {FIELD.map((f) => (
              <FieldCard key={f.title}>
                <div className="img" style={{ backgroundImage: `url(${f.img})` }} />
                <div className="b">
                  <span className="tag">{f.tag}</span>
                  <h4>{f.title}</h4>
                  <p>{f.copy}</p>
                  <span className="pl"><Globe size={12} /> {f.place}</span>
                </div>
              </FieldCard>
            ))}
          </FieldGrid>
        </Container>
      </Section>

      <Trust>
        <Container>
          <SectionHead style={{ justifyContent: 'center', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
            <div>
              <Eyebrow style={{ color: '#5EEAD4' }}>Verification &amp; trust</Eyebrow>
              <H2 style={{ marginTop: 10, marginBottom: 12, color: '#fff' }}>Three safeguards. Every cause. Every update.</H2>
              <Lead style={{ color: 'rgba(255,255,255,.85)', textAlign: 'center' }}>
                Public visibility is a privilege we grant only after independent review. Supporting
                documents stay private; approved information is what you see.
              </Lead>
            </div>
          </SectionHead>
          <TrustCols>
            <TrustCol><div className="ic"><Shield size={22} color="#fff" /></div><h4>Organization vetting</h4><p>Every organization submits verification evidence that reviewers examine privately. Public profiles never expose identity documents or sensitive records.</p></TrustCol>
            <TrustCol><div className="ic"><FileCheck size={22} color="#fff" /></div><h4>Cause-by-cause review</h4><p>Trained reviewers inspect each submission with a documented checklist. Decisions are recorded and sent back to the organization with clear reasons.</p></TrustCol>
            <TrustCol><div className="ic"><MessageSquare size={22} color="#fff" /></div><h4>Progress moderation</h4><p>Updates and attached media are reviewed before publication. Private information stays private — supporters see what organizations are authorized to share.</p></TrustCol>
          </TrustCols>
        </Container>
      </Trust>

      <Section $bg="bg">
        <Container>
          <SectionHead style={{ justifyContent: 'center', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
            <div>
              <Eyebrow>Frequently asked</Eyebrow>
              <H2 style={{ marginTop: 10, marginBottom: 12 }}>Answers before you ask</H2>
              <Lead style={{ textAlign: 'center' }}>
                If something isn&rsquo;t clear here, our review team is reachable from the Contact page.
              </Lead>
            </div>
          </SectionHead>
          <FaqList>
            {FAQS.map((f, i) => (
              <FaqItem key={f.q} $open={openFaq === i}>
                <button type="button" onClick={() => setOpenFaq(openFaq === i ? -1 : i)} aria-expanded={openFaq === i}>
                  <span className="q">{f.q}</span>
                  <span className="ic">{openFaq === i ? <Minus size={18} /> : <Plus size={18} />}</span>
                </button>
                <div className="ans">{f.a}</div>
              </FaqItem>
            ))}
          </FaqList>
        </Container>
      </Section>

      <Section $bg="surface">
        <Container>
          <SectionHead style={{ justifyContent: 'center', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
            <div>
              <Eyebrow><Globe size={12} style={{ marginRight: 6, verticalAlign: 'middle' }} />Partners &amp; collaborators</Eyebrow>
              <H2 style={{ marginTop: 10, marginBottom: 12 }}>Working alongside organizations that share our standards</H2>
            </div>
          </SectionHead>
          <Partners>
            {PARTNERS.map((p) => (
              <PartnerPill key={p.n}>
                <div className="lg" style={{ background: p.c }}>{p.n.split(' ').map((w) => w[0]).slice(0, 2).join('')}</div>
                <div>
                  <div className="t">{p.n}</div>
                  <div className="s">{p.s}</div>
                </div>
              </PartnerPill>
            ))}
          </Partners>
        </Container>
      </Section>

      <Section $bg="warm">
        <Container>
          <Newsletter>
            <div>
              <Pill $tone="accent" style={{ background: 'rgba(255,255,255,.15)', color: '#fff', border: '1px solid rgba(255,255,255,.25)' }}>
                <Sparkles size={12} /> Monthly digest
              </Pill>
              <h3>Get verified causes and progress updates in your inbox</h3>
              <p>One concise email a month — new causes, progress milestones from organizations you follow, and reviewer notes worth reading. No pleas, no fundraising calls.</p>
            </div>
            <NlWrap>
              <NlForm
                onSubmit={async (e) => {
                  e.preventDefault();
                  if (nlState === 'sending' || nlState === 'ok') return;
                  setNlState('sending');
                  try {
                    const res = await fetch('/api/subscribe', {
                      method: 'POST',
                      headers: { 'content-type': 'application/json' },
                      body: JSON.stringify({ email: nlEmail, source: 'landing' }),
                    });
                    const data = await res.json().catch(() => ({}));
                    if (!res.ok) {
                      setNlState('error');
                      setNlMsg(data?.error || 'Could not subscribe. Please try again.');
                      return;
                    }
                    setNlState('ok');
                    setNlEmail('');
                    if (data?.data?.state === 'already_subscribed') {
                      setNlMsg('You’re already subscribed — thank you.');
                    } else if (data?.data?.state === 'reactivated') {
                      setNlMsg('Welcome back — you’ll receive the next digest.');
                    } else {
                      setNlMsg('Thank you — you’ll receive the next digest.');
                    }
                  } catch {
                    setNlState('error');
                    setNlMsg('Network error. Please try again.');
                  }
                }}
              >
                <input
                  type="email"
                  required
                  placeholder="you@example.org"
                  value={nlEmail}
                  onChange={(e) => { setNlEmail(e.target.value); if (nlState !== 'idle') setNlState('idle'); }}
                  aria-label="Email address"
                  disabled={nlState === 'sending' || nlState === 'ok'}
                />
                <button type="submit" disabled={nlState === 'sending' || nlState === 'ok'}>
                  <Mail size={14} /> {nlState === 'sending' ? 'Subscribing…' : nlState === 'ok' ? 'Subscribed' : 'Subscribe'}
                </button>
              </NlForm>
              <span style={{ fontSize: 12, color: nlState === 'error' ? '#FDE68A' : 'rgba(255,255,255,.7)' }}>{nlMsg}</span>
            </NlWrap>
          </Newsletter>
        </Container>
      </Section>

      <Section $bg="warm">
        <Container>
          <OrgCtaCard>
            <div>
              <Eyebrow>For humanitarian organizations</Eyebrow>
              <H2 style={{ marginTop: 10, marginBottom: 14 }}>
                Reach supporters with the transparency they're looking for
              </H2>
              <ul>
                <li><Check size={18} strokeWidth={2.5} />Submit organization &amp; causes through a guided multi-step form</li>
                <li><Check size={18} strokeWidth={2.5} />Keep supporting documents private and only share what reviewers approve</li>
                <li><Check size={18} strokeWidth={2.5} />Publish progress updates with reviewer oversight to maintain trust</li>
                <li><Check size={18} strokeWidth={2.5} />Receive and respond to inquiries through a secure dashboard</li>
              </ul>
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                <LinkButton as={Link} href="/register" $variant="primary" $size="lg">
                  Create an organization account
                </LinkButton>
                <LinkButton as={Link} href="/about" $variant="ghost" $size="lg">
                  Read submission guidelines
                </LinkButton>
              </div>
            </div>
            <StepsVisual>
              {[
                { l: 'Step 1 · Basic information', v: 'Cause title, category, short description' },
                { l: 'Step 2 · Organization', v: 'Representative, contact email, website', active: true },
                { l: 'Step 3 · Humanitarian need', v: 'Who it supports, intended use of support' },
                { l: 'Step 4 · Supporting information', v: 'Private documents & approved media' },
                { l: 'Step 5 · Review & submit', v: 'Confirm accuracy & privacy consent' },
              ].map((s) => (
                <div className={`mini ${s.active ? 'active' : ''}`} key={s.l}>
                  <div className="l">{s.l}</div>
                  <div className="v">{s.v}</div>
                </div>
              ))}
            </StepsVisual>
          </OrgCtaCard>
        </Container>
      </Section>
    </>
  );
}
