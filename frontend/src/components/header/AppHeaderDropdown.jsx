import React from 'react'
import {
  CAvatar,
  CDropdown,
  CDropdownDivider,
  CDropdownHeader,
  CDropdownItem,
  CDropdownMenu,
  CDropdownToggle,
} from '@coreui/react'
import {
  cilAccountLogout,
  cilLockLocked,
  cilSettings,
  cilUser,
} from '@coreui/icons'
import CIcon from '@coreui/icons-react'
import { useData } from '../../context/DataContext'
import { useNavigate } from 'react-router-dom'

const AppHeaderDropdown = () => {
  const { state, dispatch } = useData()
  const navigate = useNavigate()
  const isLoggedIn = !!state.user

  return (
    <CDropdown variant="nav-item">
      <CDropdownToggle placement="bottom-end" className="py-0 pe-0" caret={false}>
        {isLoggedIn && state.user.avatar ? (
          <CAvatar src={state.user.avatar} size="md" />
        ) : (
          <CAvatar color="secondary" size="md">
            <CIcon icon={cilUser} />
          </CAvatar>
        )}
      </CDropdownToggle>
      <CDropdownMenu className="pt-0" placement="bottom-end">
        <CDropdownHeader className="bg-body-secondary fw-semibold mb-2">Account</CDropdownHeader>
        <CDropdownItem
          as="button"
          type="button"
          onClick={() => navigate(isLoggedIn ? '/settings' : '/login')}
        >
          <CIcon icon={cilSettings} className="me-2" />
          Settings
        </CDropdownItem>
        <CDropdownDivider />
        {isLoggedIn ? (
          <CDropdownItem
            as="button"
            type="button"
            onClick={() => dispatch({ type: 'LOGOUT' })}
          >
            <CIcon icon={cilAccountLogout} className="me-2" />
            Logout
          </CDropdownItem>
        ) : (
          <CDropdownItem
            as="button"
            type="button"
            onClick={() => navigate('/login')}
          >
            <CIcon icon={cilLockLocked} className="me-2" />
            Login
          </CDropdownItem>
        )}
      </CDropdownMenu>
    </CDropdown>
  )
}

export default AppHeaderDropdown
