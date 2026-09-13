/// <reference types="@testing-library/jest-dom" />

// `@types/jest` apenas estende `jest.Matchers`. Este `import` ativa
// também a augmentation contra `@jest/expect.Matchers`, usado por
// Jest 30 quando `expect()` retorna `Assertion`.
import '@testing-library/jest-dom/jest-globals'
