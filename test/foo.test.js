import foo from './foo.js'

test('foo function', () => {
  expect(foo(1, 2)).toBe(10)
  expect(foo(-1, -2)).toBe(-10)
  expect(foo(-1, 2)).toBe(0)
})
