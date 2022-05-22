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

//jest.mock("../app/Store", () => mockStore)
// Session storage - Employee
//setSessionStorage("Employee");


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
                    await waitFor(() => screen.getByText("Ce format de fichier n'est pas accepté"))

                    expect(screen.getByText("Ce format de fichier n'est pas accepté")).toBeTruthy()

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
                    //await waitFor(() => screen.getByText("image.png"))
                    //expect(screen.getByText("image.png")).toBeTruthy()
                    //expect(inputFile.files[0].name).toBe("image.png")
                    //const message = getByTestId(document.body, "message")
                    //expect(inputFile.files[0].name).toBe("image.png")
                    //console.log(message.classList)

                    //expect(screen.getByText("Ce format de fichier n'est pas accepté")).not.toBeTruthy()
                })

            })

        })
    })
})
    /////////////////////////////////////////////////////////
/* TEST API resonse

describe("When I am on NewBill Page and submit the form", () => {
    test("Then it should create a new bill", async () => {
        // Mock Firebase Post method
        const postSpy = jest.spyOn(mockStore, "post");

        // Post new Bills
        const bills = await firebase.post(newBill);
        expect(postSpy).toHaveBeenCalledTimes(1);
        expect(bills.data.length).toBe(5);
    });
    test("Then add a new bills, if API fails with 404 message error", async () => {
        // Override firebase mock for single use for throw error
        mockStore.post.mockImplementationOnce(() =>
            Promise.reject(new Error("Erreur 404"))
        );

        // UI creation with error code
        const html = BillsUI({ error: "Erreur 404" });
        document.body.innerHTML = html;

        // Await for response
        const errorMessage = await getByText(document.body, "Erreur 404");
        expect(errorMessage).toBeTruthy();
    });

    test("Then add a new bills, if API fails with 500 message error", async () => {
        mockStore.post.mockImplementationOnce(() =>
            Promise.reject(new Error("Erreur 500"))
        );

        // UI creation with error code
        const html = BillsUI({ error: "Erreur 500" });
        document.body.innerHTML = html;

        // Await for response
        const errorMessage = await getByText(document.body, "Erreur 500");
        expect(errorMessage).toBeTruthy();
    });
});

// NewBill submition Tests
describe("When bill form is submited", () => {
    // Test for dive into createBill
    test("then add new bill", async () => {
        // UI Construction
        constructNewBillUI();

        // Init new bill
        const bill = new NewBill({
            document,
            onNavigate,
            mockStore: null,
            localStorage: window.localStorage,
        });

        // If undefined, createBill called
        expect(await bill.createBill(newBill)).toBeUndefined();
    });

    test("then create Bill and redirect to Bills", async () => {
        // UI Construction
        constructNewBillUI();

        // Init new bill
        const bill = new NewBill({
            document,
            onNavigate,
            mockStore,
            localStorage: window.localStorage,
        });

        bill.createBill = (bill) => bill;

        // Definition of field values
        // with mock Data
        getByTestId(document.body, "expense-type").value = newBill.type;
        getByTestId(document.body, "expense-name").value = newBill.name;
        getByTestId(document.body, "amount").value = newBill.amount;
        getByTestId(document.body, "datepicker").value = newBill.date;
        getByTestId(document.body, "vat").value = newBill.vat;
        getByTestId(document.body, "pct").value = newBill.pct;
        getByTestId(document.body, "commentary").value = newBill.commentary;
        bill.fileUrl = newBill.fileUrl;
        bill.fileName = newBill.fileName;

        // Get form
        const submit = getByTestId(document.body, "form-new-bill");

        // Add event listener Submit on form and fire
        const handleSubmit = jest.fn((e) => bill.handleSubmit(e));
        submit.addEventListener("click", handleSubmit);
        userEvent.click(submit);
        expect(handleSubmit).toHaveBeenCalled();
        expect(global.window.location.pathname).toEqual("/");
    });
});
})
*/