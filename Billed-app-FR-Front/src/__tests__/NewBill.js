/**
 * @jest-environment jsdom
 */


import "@testing-library/jest-dom"
import { screen, fireEvent, getByTestId, getByText, waitFor, waitForElementToBeRemoved } from "@testing-library/dom"
import userEvent from "@testing-library/user-event"
import mockStore from "../__mocks__/store.js"
import { setSessionStorage } from "../../setup-jest"
import Store from "../app/Store.js"
//import BillsUI from "../views/BillsUI.js"
import NewBillUI from "../views/NewBillUI.js"
import NewBill from "../containers/NewBill.js"
import { ROUTES, ROUTES_PATH } from "../constants/routes.js"
import { localStorageMock } from "../__mocks__/localStorage.js"
import { bills } from "../fixtures/bills.js"
import router from "../app/Router.js"

jest.mock("../app/Store", () => mockStore)


describe("Given I am connected as an employee", () => {
  describe("When I am on NewBill Page", () => {
    test("Then mail icon in vertical layout should be highlighted", async () => {
      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      router()
      window.onNavigate(ROUTES_PATH.NewBill)
      await waitFor(() => screen.getByTestId('icon-mail'))
      const windowIcon = screen.getByTestId('icon-mail')
      expect(windowIcon).toHaveClass('active-icon')
    })
    describe("When I choose an file to upload ", () => {
      describe("When I choose a wrong format of file ", () => {
        test("Then an error message is displayed", async () => {
          const onNavigate = (pathname) => {
            document.body.innerHTML = ROUTES({ pathname })
          }
          Object.defineProperty(window, 'localStorage', { value: localStorageMock })
          window.localStorage.setItem('user', JSON.stringify({
            type: 'Employee'
          }))
          //document.body.innerHTML = NewBillUI()
          const newBill = new NewBill({
            document, onNavigate, store: mockStore, localStorage: localStorageMock
          })
          const handleChangeFile = jest.fn(newBill.handleChangeFile)
          const inputFile = screen.getByTestId("file")
          inputFile.addEventListener("change", handleChangeFile)
          fireEvent.change(inputFile, {
            target: {
              files: [
                new File(["document.txt"], "document.txt", {
                  type: "document/txt"
                })
              ]
            }
          })
          expect(screen.getByText("Envoyer une note de frais")).toBeTruthy()
          expect(handleChangeFile).toBeCalled()
          //expect(inputFile.files[0].name).toBe("document.txt")
          //await waitFor(() => screen.getByText("Ce format de fichier n'est pas accepté"))
          await waitFor(() => getByTestId(document.body, "message"))
          expect(getByTestId(document.body, "message").classList).not.toContain("hidden")
          //expect(screen.getByText("Ce format de fichier n'est pas accepté")).toBeTruthy()

        })
      })
      describe("When I choose a good format of file ", () => {
        test("Then the file input should get the file name", async () => {
          const onNavigate = (pathname) => {
            document.body.innerHTML = ROUTES({ pathname })
          }
          Object.defineProperty(window, 'localStorage', { value: localStorageMock })
          window.localStorage.setItem('user', JSON.stringify({
            type: 'Employee'
          }))
          //document.body.innerHTML = NewBillUI()
          const newBill = new NewBill({
            document, onNavigate, store: mockStore, localeStorage: localStorageMock
          })
          const handleChangeFile = jest.fn(newBill.handleChangeFile)
          const inputFile = screen.getByTestId("file")
          //inputFile.value = ""
          inputFile.addEventListener("change", handleChangeFile)
          fireEvent.change(inputFile, {
            target: {
              files: [
                new File(["image.png"], "image.png", {
                  type: "image/png"
                })
              ]
            }
          })
          expect(screen.getByText("Envoyer une note de frais")).toBeTruthy()
          expect(handleChangeFile).toBeCalled()
          await waitFor(() => getByTestId(document.body, "message"))
          expect(getByTestId(document.body, "message").classList).toContain("hidden")
          setTimeout(async () => {
            await waitFor(() => screen.getByText("image.png"))
            expect(screen.getByText("image.png")).toBeTruthy()
            expect(inputFile.files[0].name).toBe("image.png")
          }, 1000)
        })
      })
    })
  })
})

// TEST API resonse

describe("When I am on NewBill Page and submit the form", () => {
  beforeEach(() => {
    jest.spyOn(mockStore, "bills")
    Object.defineProperty(
      window,
      'localStorage',
      { value: localStorageMock }
    )
    window.localStorage.setItem('user', JSON.stringify({
      type: 'Employee',
      email: "a@a"
    }))
    const root = document.createElement("div")
    root.setAttribute("id", "root")
    document.body.appendChild(root)
    router()
  })
  describe("When API is OK", () => {
    test("Then it should call updatebills function", async () => {
      const newBill = new NewBill({
        document, onNavigate, store: mockStore, localeStorage: localStorageMock
      })
      const handleSubmit = jest.fn(newBill.handleSubmit)
      const form = screen.getByTestId("form-new-bill")
      form.addEventListener("submit", handleSubmit)
      fireEvent.submit(form)
      //await new Promise(resolve => setTimeout(resolve, 1000)) /// Si nous attendons la résolution d'une promesse quelconque
      expect(mockStore.bills).toHaveBeenCalled()
      /*setTimeout(() => {
          expect(mockStore.bills().update).toBeCalled()
      }, 1000)*/
    })
  })
  describe("When API fail", () => {
    test("Then it should display an error", async () => {
      window.onNavigate(ROUTES_PATH.NewBill)
      mockStore.bills.mockImplementationOnce(() => {
        return {
          update: () => {
            return Promise.reject(new Error("Erreur"))
          }
        }
      })
      const newBill = new NewBill({
        document, onNavigate, store: mockStore, localeStorage: localStorageMock
      })
      const handleSubmit = jest.fn(newBill.handleSubmit)
      const form = screen.getByTestId("form-new-bill")
      form.addEventListener("submit", handleSubmit)
      fireEvent.submit(form)

      setTimeout(() => {
        expect(getByTestId(document.body, "error").classList).not.toContain("hidden")
      }, 1000)
    })
  })
})

