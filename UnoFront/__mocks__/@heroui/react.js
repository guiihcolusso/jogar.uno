/* eslint-disable @typescript-eslint/no-unused-vars, unused-imports/no-unused-vars --
   these mocks intentionally destructure non-DOM props (isOpen, onPress, ...) so they
   don't leak onto the underlying DOM element via `...rest`. */
import React from 'react'

// Mocks every `@heroui/react` component with simple, semantic wrappers so
// RTL queries (getByRole, getByText, form submission) behave like the real
// (react-aria-components-based) library without needing its full runtime.
const createMockComponent = (displayName, tag = 'div') => {
  const Component = React.forwardRef((props, ref) => {
    const { children, className, isOpen, onOpenChange, state, isDisabled, onPress, onClick, ...rest } = props
    const handlers = {}
    if (onPress || onClick) {
      handlers.onClick = (event) => {
        onClick?.(event)
        onPress?.(event)
      }
    }
    return React.createElement(
      tag,
      { ref, className, disabled: isDisabled, 'data-testid': displayName, ...handlers, ...rest },
      children,
    )
  })
  Component.displayName = displayName
  return Component
}

const createNestedComponent = (parentName, subComponents = [], tag = 'div') => {
  const Parent = createMockComponent(parentName, tag)
  subComponents.forEach((subName) => {
    Parent[subName] = createMockComponent(`${parentName}.${subName}`)
  })
  return Parent
}

const InputMock = React.forwardRef((props, ref) => React.createElement('input', { ref, ...props }))
InputMock.displayName = 'Input'

const ButtonMock = React.forwardRef(({ children, isDisabled, onPress, onClick, isIconOnly, fullWidth, variant, size, ...rest }, ref) =>
  React.createElement(
    'button',
    {
      ref,
      disabled: isDisabled,
      onClick: (event) => {
        onClick?.(event)
        onPress?.(event)
      },
      ...rest,
    },
    children,
  ),
)
ButtonMock.displayName = 'Button'

const overlayShape = ['Root', 'Trigger', 'Backdrop', 'Container', 'Dialog', 'Header', 'Heading', 'Body', 'Footer', 'Icon', 'CloseTrigger']

const AvatarMock = createNestedComponent('Avatar', ['Image', 'Fallback'])
const CardMock = createNestedComponent('Card', ['Header', 'Title', 'Description', 'Content', 'Footer'])
const ModalMock = createNestedComponent('Modal', overlayShape)
const DrawerMock = createNestedComponent('Drawer', [...overlayShape, 'Handle'])
const AlertDialogMock = createNestedComponent('AlertDialog', overlayShape)
const ChipMock = createNestedComponent('Chip', ['Label'])
const BadgeMock = createNestedComponent('Badge', ['Label', 'Anchor'])
const ToastMock = createNestedComponent('Toast', ['Provider'])
const BreadcrumbsMock = createNestedComponent('Breadcrumbs', ['Item'])

module.exports = {
  Avatar: AvatarMock,
  Breadcrumbs: BreadcrumbsMock,
  Button: ButtonMock,
  Card: CardMock,
  Modal: ModalMock,
  Drawer: DrawerMock,
  AlertDialog: AlertDialogMock,
  Chip: ChipMock,
  Badge: BadgeMock,
  Input: InputMock,
  Toast: ToastMock,
  toast: Object.assign(() => 'toast-id', {
    success: () => 'toast-id',
    danger: () => 'toast-id',
    info: () => 'toast-id',
    warning: () => 'toast-id',
    update: () => 'toast-id',
    promise: () => 'toast-id',
    close: () => {},
    clear: () => {},
  }),
  Skeleton: createMockComponent('Skeleton'),
  Spinner: createMockComponent('Spinner'),
  HeroUIProvider: createMockComponent('HeroUIProvider'),
  useOverlayState: (initial = {}) => {
    const [isOpen, setIsOpen] = React.useState(initial.isOpen ?? initial.defaultOpen ?? false)
    return {
      isOpen,
      setOpen: setIsOpen,
      open: () => setIsOpen(true),
      close: () => setIsOpen(false),
      toggle: () => setIsOpen((value) => !value),
    }
  },
}
