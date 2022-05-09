/**
 * @jest-environment jsdom
 */


import "@testing-library/jest-dom";
import {
    screen,
    fireEvent,
    getByTestId,
    getByText,
    waitFor,
    waitForElementToBeRemoved,
} from "@testing-library/dom";
import userEvent from "@testing-library/user-event";
import { localStorageMock } from "../__mocks__/localStorage.js"
import NewBillUI from "../views/NewBillUI.js";
import BillsUI from "../views/BillsUI.js";
import NewBill from "../containers/NewBill.js";
import { bills } from "../fixtures/bills";
import router from "../app/Router";
import { ROUTES, ROUTES_PATH } from "../constants/routes";

/*const constructNewBillUI = () => {
    const html = NewBillUI();
    document.body.innerHTML = html;
    return html;
};

// Session storage - Employee
setSessionStorage("Employee");

const newBill = {
    id: "47qAXb6fIm2zOKkLzMro",
    vat: "80",
    fileUrl:
        "https://firebasestorage.googleapis.com/v0/b/billable-677b6.a…f-1.jpg?alt=media&token=c1640e12-a24b-4b11-ae52-529112e9602a",
    status: "pending",
    type: "Hôtel et logement",
    commentary: "séminaire billed",
    name: "encore",
    fileName: "preview-facture-free-201801-pdf-1.jpg",
    date: "2004-04-04",
    amount: 400,
    commentAdmin: "ok",
    email: "a@a",
    pct: 20,
};
*/

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
        describe("When I choose an wrong file to upload ", () => {
            test("Then an error message is displayed", async () => {
                const onNavigate = (pathname) => {
                    document.body.innerHTML = ROUTES({ pathname })
                }
                document.body.innerHTML = NewBillUI()
                const newBill = new NewBill({
                    document, onNavigate, store: null, localStorage: window.localStorage
                })
                const handleChangeFile = jest.fn(newBill.handleChangeFile)
                //const alerte = jest.fn(newBill.alert())
                const inputFile = getByTestId(document.body, "file");
                inputFile.addEventListener("change", handleChangeFile);
                fireEvent.change(inputFile, {
                    target: {
                        files: [
                            new File(["document.txt"], "document.txt", {
                                type: "document/txt",
                            }),
                        ],
                    },
                });

                expect(handleChangeFile).toBeCalled();
                //Wrong format
                expect(inputFile.files[0].name).toBe("document.txt");
                expect(screen.getByText("Envoyer une note de frais")).toBeTruthy();
                /*await waitFor(() => {
                    expect(window.alert).toBeCalled()
                })*/
            })
        })
    });

    /////////////////////////////////////////////////////////

    describe("When I choose an image to upload ", () => {
        test("Then the file input should get the file name", () => {
            /**
             * Control upload file format
             * If good format
             * UI Construction
             * Create DOM HTML
             * Mock handleChangeFile function
             * Launch File with good Format
             * Check if not displayed error message
             */

            const domHtml = constructNewBillUI();

            // Init newBill Class constructor
            const newBill = new NewBill({
                document,
                onNavigate,
                firestore: null,
                localStorage: window.localStorage,
            });

            // Mock function handleChangeFile
            const handleChangeFile = jest.fn(() => newBill.handleChangeFile);

            // Add Event and fire
            const inputFile = screen.getByTestId("file");
            inputFile.addEventListener("change", handleChangeFile);

            inputFile.value = "";

            // Launch file
            fireEvent.change(inputFile, {
                target: {
                    files: [new File(["image.png"], "image.png", { type: "image/png" })],
                },
            });
            expect(handleChangeFile).toBeCalled();
            //Good format
            expect(inputFile.files[0].name).toBe("image.png");
            expect(
                getByText(document.body, "Envoyer une note de frais")
            ).toBeTruthy();
            expect(
                domHtml.includes(
                    '<div class="hide errorMessage" id="error-filetype" data-testid="error-filetype">'
                )
            ).toBeTruthy();
        });
    });

    // TEST API resonse

    describe("When I am on NewBill Page and submit the form", () => {
        test("Then it should create a new bill", async () => {
            // Mock Firebase Post method
            const postSpy = jest.spyOn(firebase, "post");

            // Post new Bills
            const bills = await firebase.post(newBill);
            expect(postSpy).toHaveBeenCalledTimes(1);
            expect(bills.data.length).toBe(5);
        });
        test("Then add a new bills, if API fails with 404 message error", async () => {
            // Override firebase mock for single use for throw error
            firebase.post.mockImplementationOnce(() =>
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
            firebase.post.mockImplementationOnce(() =>
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
                firestore: null,
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
                Firestore,
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
});