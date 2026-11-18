'use client';

import type { ReactNode } from 'react';
import styled from 'styled-components';
import { Search, Bell } from 'lucide-react';

const Bar = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
  padding-bottom: 18px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  gap: 16px;
  @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
    margin-bottom: 18px;
    padding-bottom: 14px;
    gap: 8px;
  }
`;
const Left = styled.div`
  display: flex;
  align-items: center;
  gap: 14px;
  flex: 1;
`;
const SearchWrap = styled.div`
  position: relative;
  width: 100%;
  max-width: 380px;
  @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
    max-width: none;
    input { font-size: 14px; padding: 9px 12px 9px 34px; }
  }
  svg {
    position: absolute;
    left: 12px;
    top: 50%;
    transform: translateY(-50%);
    color: ${({ theme }) => theme.colors.muted};
  }
  input {
    width: 100%;
    padding: 9px 14px 9px 36px;
    border: 1px solid ${({ theme }) => theme.colors.border};
    border-radius: 9px;
    font-size: 13px;
    background: #fff;
    font-family: inherit;
    &:focus {
      outline: none;
      border-color: ${({ theme }) => theme.colors.primary};
    }
  }
`;
const Right = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;
const IconBtn = styled.button`
  width: 36px;
  height: 36px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: #fff;
  border-radius: 9px;
  display: grid;
  place-items: center;
  color: ${({ theme }) => theme.colors.ink};
  cursor: pointer;
  position: relative;
  .dot {
    position: absolute;
    top: 7px;
    right: 8px;
    width: 7px;
    height: 7px;
    background: ${({ theme }) => theme.colors.error};
    border-radius: 999px;
    border: 2px solid #fff;
  }
`;
const Avatar = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 5px 10px 5px 5px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 999px;
  background: #fff;
  .av {
    width: 28px;
    height: 28px;
    border-radius: 999px;
    background: linear-gradient(
      135deg,
      ${({ theme }) => theme.colors.primary},
      ${({ theme }) => theme.colors.primary800}
    );
    color: #fff;
    display: grid;
    place-items: center;
    font-weight: 700;
    font-size: 12px;
  }
  .nm {
    font-size: 13px;
    font-weight: 600;
    color: ${({ theme }) => theme.colors.ink};
  }
  .rl {
    font-size: 11px;
    color: ${({ theme }) => theme.colors.muted};
  }
  @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
    padding: 0;
    border: 0;
    background: transparent;
    .who { display: none; }
    .av { width: 36px; height: 36px; }
  }
`;

interface Props {
  searchPlaceholder?: string;
  userName: string;
  userInitial: string;
  userRole: string;
  rightSlot?: ReactNode;
}

export function Topbar({ searchPlaceholder, userName, userInitial, userRole, rightSlot }: Props) {
  return (
    <Bar>
      <Left>
        {searchPlaceholder && (
          <SearchWrap>
            <Search size={15} />
            <input type="search" placeholder={searchPlaceholder} />
          </SearchWrap>
        )}
      </Left>
      <Right>
        {rightSlot}
        <IconBtn aria-label="Notifications">
          <Bell size={16} />
          <span className="dot" />
        </IconBtn>
        <Avatar>
          <div className="av">{userInitial}</div>
          <div className="who">
            <div className="nm">{userName}</div>
            <div className="rl">{userRole}</div>
          </div>
        </Avatar>
      </Right>
    </Bar>
  );
}

export const Crumbs = styled.div`
  font-size: 13px;
  color: ${({ theme }) => theme.colors.muted};
  margin-bottom: 8px;
  a {
    color: ${({ theme }) => theme.colors.muted};
    &:hover {
      color: ${({ theme }) => theme.colors.primary};
    }
  }
  span.sep {
    margin: 0 6px;
  }
  strong {
    color: ${({ theme }) => theme.colors.ink};
    font-weight: 500;
  }
`;

export const PageTitle = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-bottom: 28px;
  flex-wrap: wrap;
  gap: 16px;
`;

export const Shell = styled.div<{ $sidebarWidth?: number }>`
  display: grid;
  grid-template-columns: ${({ $sidebarWidth = 260 }) => $sidebarWidth}px 1fr;
  min-height: 100vh;
  @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
    grid-template-columns: 1fr;
    grid-template-rows: auto 1fr;
    align-content: start;
    > aside {
      display: none;
    }
  }
`;

export const Main = styled.main`
  padding: 28px 32px 48px;
  min-width: 0;
  @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
    padding: 16px;
  }
`;
