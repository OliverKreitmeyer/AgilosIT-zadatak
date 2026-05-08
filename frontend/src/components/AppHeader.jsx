/**
 * AppHeader Component
 *
 * Main application header with navigation, theme switcher, and user menu.
 * Features include:
 * - Sidebar toggle button
 * - Primary navigation links
 * - Notification and action icons
 * - Theme switcher (light/dark/auto)
 * - User dropdown menu
 * - Breadcrumb navigation
 * - Sticky positioning with scroll shadow effect
 *
 * @component
 * @example
 * return (
 *   <AppHeader />
 * )
 */

import React, { useEffect, useRef } from 'react'
import { NavLink } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import {
  CBadge,
  CContainer,
  CDropdown,
  CDropdownDivider,
  CDropdownHeader,
  CDropdownItem,
  CDropdownMenu,
  CDropdownToggle,
  CHeader,
  CHeaderNav,
  CHeaderToggler,
  CNavLink,
  CNavItem,
  CSpinner,
  useColorModes,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import {
  cilBell,
  cilContrast,
  cilMenu,
  cilMoon,
  cilSun,
  cilTrash,
  cilCheckCircle,
  cilXCircle,
} from '@coreui/icons'

import { AppBreadcrumb } from './index'
import { AppHeaderDropdown } from './header/index'
import { useData } from '../context/DataContext'
import { useNotification } from '../context/NotificationContext'

/**
 * AppHeader functional component
 *
 * Manages header UI including:
 * - Redux integration for sidebar state
 * - Theme management with CoreUI useColorModes hook
 * - Scroll-based shadow effect
 * - Responsive navigation
 *
 * @returns {React.ReactElement} Header component with navigation and controls
 */
const AppHeader = () => {
  const headerRef = useRef()
  const { colorMode, setColorMode } = useColorModes('coreui-free-react-admin-template-theme')

  const dispatch = useDispatch()
  const sidebarShow = useSelector((state) => state.sidebarShow)
  const { state: dataState } = useData()
  const { runningForecast } = dataState
  const { history, unreadCount, markAllRead, clearHistory } = useNotification()

  useEffect(() => {
    const handleScroll = () => {
      headerRef.current &&
        headerRef.current.classList.toggle('shadow-sm', document.documentElement.scrollTop > 0)
    }

    document.addEventListener('scroll', handleScroll)
    return () => document.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <CHeader position="sticky" className="mb-4 p-0" ref={headerRef}>
      <CContainer className="border-bottom px-4" fluid>
        <CHeaderToggler
          onClick={() => dispatch({ type: 'set', sidebarShow: !sidebarShow })}
          style={{ marginInlineStart: '-14px' }}
        >
          <CIcon icon={cilMenu} size="lg" />
        </CHeaderToggler>
        <CHeaderNav className="d-none d-md-flex">
          <CNavItem>
            <CNavLink to="/dashboard" as={NavLink}>
              Dashboard
            </CNavLink>
          </CNavItem>
        </CHeaderNav>
        <CHeaderNav className="ms-auto">
          {runningForecast && (
            <CNavItem className="d-flex align-items-center me-2">
              <CSpinner size="sm" className="me-2 text-primary" />
              <span className="small text-body-secondary d-none d-md-inline">
                Running {runningForecast.modelName}...
              </span>
            </CNavItem>
          )}
          <CDropdown variant="nav-item" placement="bottom-end" onShow={markAllRead}>
            <CDropdownToggle caret={false} className="position-relative">
              <CIcon icon={cilBell} size="lg" />
              {unreadCount > 0 && (
                <CBadge
                  color="danger"
                  shape="rounded-pill"
                  className="position-absolute top-0 start-100 translate-middle"
                  style={{ fontSize: '0.65rem' }}
                >
                  {unreadCount}
                </CBadge>
              )}
            </CDropdownToggle>
            <CDropdownMenu style={{ minWidth: '320px', maxHeight: '400px', overflowY: 'auto' }}>
              <CDropdownHeader className="bg-body-secondary fw-semibold d-flex justify-content-between align-items-center">
                <span>Notifications</span>
                {history.length > 0 && (
                  <button
                    className="btn btn-sm btn-link text-body-secondary p-0"
                    onClick={(e) => {
                      e.stopPropagation()
                      clearHistory()
                    }}
                  >
                    <CIcon icon={cilTrash} size="sm" />
                  </button>
                )}
              </CDropdownHeader>
              {history.length === 0 ? (
                <CDropdownItem disabled className="text-center text-body-secondary py-3">
                  No notifications yet
                </CDropdownItem>
              ) : (
                history.map((n) => (
                  <CDropdownItem key={n.id} as="div" className="py-2 border-bottom">
                    <div className="d-flex align-items-start">
                      <CIcon
                        icon={n.color === 'danger' ? cilXCircle : cilCheckCircle}
                        className={`me-2 mt-1 flex-shrink-0 text-${n.color}`}
                      />
                      <div className="flex-grow-1 min-w-0">
                        <div className="fw-semibold small">{n.title}</div>
                        <div className="text-body-secondary small text-truncate">{n.message}</div>
                        <div className="text-body-secondary small" style={{ fontSize: '0.7rem' }}>
                          {new Date(n.timestamp).toLocaleTimeString()}
                        </div>
                      </div>
                    </div>
                  </CDropdownItem>
                ))
              )}
            </CDropdownMenu>
          </CDropdown>
        </CHeaderNav>
        <CHeaderNav>
          <li className="nav-item py-1">
            <div className="vr h-100 mx-2 text-body text-opacity-75"></div>
          </li>
          <CDropdown variant="nav-item" placement="bottom-end">
            <CDropdownToggle caret={false}>
              {colorMode === 'dark' ? (
                <CIcon icon={cilMoon} size="lg" />
              ) : colorMode === 'auto' ? (
                <CIcon icon={cilContrast} size="lg" />
              ) : (
                <CIcon icon={cilSun} size="lg" />
              )}
            </CDropdownToggle>
            <CDropdownMenu>
              <CDropdownItem
                active={colorMode === 'light'}
                className="d-flex align-items-center"
                as="button"
                type="button"
                onClick={() => setColorMode('light')}
              >
                <CIcon className="me-2" icon={cilSun} size="lg" /> Light
              </CDropdownItem>
              <CDropdownItem
                active={colorMode === 'dark'}
                className="d-flex align-items-center"
                as="button"
                type="button"
                onClick={() => setColorMode('dark')}
              >
                <CIcon className="me-2" icon={cilMoon} size="lg" /> Dark
              </CDropdownItem>
              <CDropdownItem
                active={colorMode === 'auto'}
                className="d-flex align-items-center"
                as="button"
                type="button"
                onClick={() => setColorMode('auto')}
              >
                <CIcon className="me-2" icon={cilContrast} size="lg" /> Auto
              </CDropdownItem>
            </CDropdownMenu>
          </CDropdown>
          <li className="nav-item py-1">
            <div className="vr h-100 mx-2 text-body text-opacity-75"></div>
          </li>
          <AppHeaderDropdown />
        </CHeaderNav>
      </CContainer>
      <CContainer className="px-4" fluid>
        <AppBreadcrumb />
      </CContainer>
    </CHeader>
  )
}

export default AppHeader
