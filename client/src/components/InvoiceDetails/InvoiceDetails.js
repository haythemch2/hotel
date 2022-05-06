import React, { useState, useEffect } from "react";
// import "../../../node_modules/react-progress-button/react-progress-button.css"
import { useSnackbar } from "react-simple-snackbar";
import { useLocation, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { initialState } from "../../initialState";
import { getInvoice } from "../../actions/invoiceActions";
import { toCommas } from "../../utils/utils";
import styles from "./InvoiceDetails.module.css";
import moment from "moment";
import { useHistory } from "react-router-dom";
import { makeStyles } from "@material-ui/core/styles";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableContainer from "@material-ui/core/TableContainer";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import Paper from "@material-ui/core/Paper";
import Typography from "@material-ui/core/Typography";
import InputBase from "@material-ui/core/InputBase";
import { Container, Grid } from "@material-ui/core";
import Divider from "@material-ui/core/Divider";
import BorderColorIcon from "@material-ui/icons/BorderColor";
import MonetizationOnIcon from "@material-ui/icons/MonetizationOn";
import Spinner from "../Spinner/Spinner";

import ProgressButton from "react-progress-button";
import axios from "axios";
import { saveAs } from "file-saver";
import Modal from "../Payments/Modal";
import PaymentHistory from "./PaymentHistory";

const InvoiceDetails = () => {
  const location = useLocation();
  const [invoiceData, setInvoiceData] = useState(initialState);
  const [rates, setRates] = useState(0);
  const [vat, setVat] = useState(0);
  const [fodee, setFodee] = useState(0);
  const [dsht, setDsht] = useState(0);
  const [dTimbre, setDTimbre] = useState(0);
  const [currency, setCurrency] = useState("");
  const [subTotal, setSubTotal] = useState(0);
  const [total, setTotal] = useState(0);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [client, setClient] = useState([]);
  const [type, setType] = React.useState("");
  const [status, setStatus] = useState("");
  const [company, setCompany] = useState({});
  const { id } = useParams();
  const { invoice } = useSelector((state) => state.invoices);
  const dispatch = useDispatch();
  const history = useHistory();
  const [sendStatus, setSendStatus] = useState(null);
  const [downloadStatus, setDownloadStatus] = useState(null);
  // eslint-disable-next-line
  const [openSnackbar, closeSnackbar] = useSnackbar();
  const user = JSON.parse(localStorage.getItem("profile"));

  const useStyles = makeStyles((theme) => ({
    root: {
      display: "flex",
      "& > *": {
        margin: theme.spacing(1),
      },
    },
    large: {
      width: theme.spacing(12),
      height: theme.spacing(12),
    },
    table: {
      minWidth: 650,
    },

    headerContainer: {
      // display: 'flex'
      paddingTop: theme.spacing(1),
      paddingLeft: theme.spacing(5),
      paddingRight: theme.spacing(1),
      backgroundColor: "#f2f2f2",
      borderRadius: "10px 10px 0px 0px",
    },
  }));

  const classes = useStyles();

  useEffect(() => {
    dispatch(getInvoice(id));
  }, [id, dispatch, location]);

  useEffect(() => {
    if (invoice) {
      //Automatically set the default invoice values as the ones in the invoice to be updated
      setInvoiceData(invoice);
      setRates(invoice.rates);
      setClient(invoice.client);
      setType(invoice.type);
      setStatus(invoice.status);
      setSelectedDate(invoice.dueDate);
      setVat(invoice.vat);
      setFodee(invoice.fodee);
      setDsht(invoice.dsht);
      setDTimbre(invoice.dTimbre);
      setCurrency(invoice.currency);
      setSubTotal(invoice.subTotal);
      setTotal(invoice.total);
      setCompany(invoice?.businessDetails?.data?.data);
    }
  }, [invoice]);

  //Get the total amount paid
  let totalAmountReceived = 0;
  for (var i = 0; i < invoice?.paymentRecords?.length; i++) {
    totalAmountReceived += Number(invoice?.paymentRecords[i]?.amountPaid);
  }

  const editInvoice = (id) => {
    history.push(`/edit/invoice/${id}`);
  };

  const createAndDownloadPdf = () => {
    setDownloadStatus("loading");
    axios
      .post(`${process.env.REACT_APP_API}/create-pdf`, {
        name: invoice?.client.name,
        address: invoice?.client.address,
        phone: invoice?.client.phone,
        email: invoice?.client.email,
        dueDate: invoice.dueDate,
        date: invoice?.createdAt,
        id: invoice?.invoiceNumber,
        notes: invoice?.notes,
        subTotal: toCommas(invoice.subTotal),
        total: toCommas(invoice.total),
        type: invoice?.type,
        vat: invoice?.vat,
        fodee: invoice?.fodee,
        dsht: invoice?.dsht,
        dTimbr:invoice?.dTimbr,
        items: invoice?.items,
        status: invoice?.status,
        totalAmountReceived: toCommas(totalAmountReceived),
        balanceDue: toCommas(total - totalAmountReceived),
        company: company,
      })
      .then(() =>
        axios.get(`${process.env.REACT_APP_API}/fetch-pdf`, {
          responseType: "blob",
        })
      )
      .then((res) => {
        const pdfBlob = new Blob([res.data], { type: "application/pdf" });

        saveAs(pdfBlob, "facture.pdf");
      })
      .then(() => setDownloadStatus("success"));
  };

  //SEND PDF INVOICE VIA EMAIL
  const sendPdf = (e) => {
    e.preventDefault();
    setSendStatus("loading");
    axios
      .post(`${process.env.REACT_APP_API}/send-pdf`, {
        name: invoice.client.name,
        address: invoice.client.address,
        phone: invoice.client.phone,
        email: invoice.client.email,
        dueDate: invoice.dueDate,
        date: invoice.createdAt,
        id: invoice.invoiceNumber,
        notes: invoice.notes,
        subTotal: toCommas(invoice.subTotal),
        total: toCommas(invoice.total),
        type: invoice.type,
        vat: invoice.vat,
        items: invoice.items,
        status: invoice.status,
        totalAmountReceived: toCommas(totalAmountReceived),
        balanceDue: toCommas(total - totalAmountReceived),
        link: `${process.env.REACT_APP_URL}/invoice/${invoice._id}`,
        company: company,
      })
      // .then(() => console.log("invoice sent successfully"))
      .then(() => setSendStatus("success"))
      .catch((error) => {
        console.log(error);
        setSendStatus("error");
      });
  };

  const iconSize = {
    height: "18px",
    width: "18px",
    marginRight: "10px",
    color: "gray",
  };
  const [open, setOpen] = useState(false);

  function checkStatus() {
    return totalAmountReceived >= total
      ? "green"
      : status === "Partielle"
      ? "#1976d2"
      : status === "Payé"
      ? "green"
      : status === "Non payé"
      ? "red"
      : "red";
  }

  if (!invoice) {
    return <Spinner />;
  }

  return (
    <div className={styles.PageLayout}>
      {invoice?.creator?.includes(
        user?.result?._id || user?.result?.googleId
      ) && (
        <div className={styles.buttons}>
          <ProgressButton
            onClick={sendPdf}
            state={sendStatus}
            onSuccess={() => openSnackbar("Facture envoyée avec succès")}
          >
            Send to Customer
          </ProgressButton>

          <ProgressButton onClick={createAndDownloadPdf} state={downloadStatus}>
            Download PDF
          </ProgressButton>

          <button
            className={styles.btn}
            onClick={() => editInvoice(invoiceData._id)}
          >
            <BorderColorIcon style={iconSize} />
            Edit Invoice
          </button>

          <button
            // disabled={status === 'Paid' ? true : false}
            className={styles.btn}
            onClick={() => setOpen((prev) => !prev)}
          >
            <MonetizationOnIcon style={iconSize} />
            Enregistrer le paiement
          </button>
        </div>
      )}

      {invoice?.paymentRecords.length !== 0 && (
        <PaymentHistory paymentRecords={invoiceData?.paymentRecords} />
      )}

      <Modal open={open} setOpen={setOpen} invoice={invoice} />
      <div className={styles.invoiceLayout}>
        <Container className={classes.headerContainer}>
          <Grid
            container
            justifyContent="space-between"
            style={{ padding: "30px 0px" }}
          >
            {!invoice?.creator?.includes(
              user?.result._id || user?.result?.googleId
            ) ? (
              <Grid item></Grid>
            ) : (
              <Grid
                item
                onClick={() => history.push("/settings")}
                style={{ cursor: "pointer" }}
              >
                {company?.logo ? (
                  <img src={company?.logo} alt="Logo" className={styles.logo} />
                ) : (
                  <h2>{company?.name}</h2>
                )}
              </Grid>
            )}
            <Grid item style={{ marginRight: 40, textAlign: "right" }}>
              <Typography
                style={{
                  lineSpacing: 1,
                  fontSize: 45,
                  fontWeight: 700,
                  color: "gray",
                }}
              >
                {Number(total - totalAmountReceived) <= 0 ? "Receipt" : type}
              </Typography>
              <Typography variant="overline" style={{ color: "gray" }}>
                Non:{" "}
              </Typography>
              <Typography variant="body2">
                {invoiceData?.invoiceNumber}
              </Typography>
            </Grid>
          </Grid>
        </Container>
        <Divider />
        <Container>
          <Grid
            container
            justifyContent="space-between"
            style={{ marginTop: "40px" }}
          >
            <Grid item>
              {invoice?.creator?.includes(user?.result._id) && (
                <Container style={{ marginBottom: "20px" }}>
                  <Typography
                    variant="overline"
                    style={{ color: "gray" }}
                    gutterBottom
                  >
                    Depuis
                  </Typography>
                  <Typography variant="subtitle2">
                    {invoice?.businessDetails?.data?.data?.businessName}
                  </Typography>
                  <Typography variant="body2">
                    {invoice?.businessDetails?.data?.data?.email}
                  </Typography>
                  <Typography variant="body2">
                    {invoice?.businessDetails?.data?.data?.phoneNumber}
                  </Typography>
                  <Typography variant="body2" gutterBottom>
                    {invoice?.businessDetails?.data?.data?.address}
                  </Typography>
                </Container>
              )}
              <Container>
                <Typography
                  variant="overline"
                  style={{ color: "gray", paddingRight: "3px" }}
                  gutterBottom
                >
                  facturer
                </Typography>
                <Typography variant="subtitle2" gutterBottom>
                  {client?.name}
                </Typography>
                <Typography variant="body2">{client?.email}</Typography>
                <Typography variant="body2">{client?.phone}</Typography>
                <Typography variant="body2">{client?.address}</Typography>
              </Container>
            </Grid>

            <Grid item style={{ marginRight: 20, textAlign: "right" }}>
              <Typography
                variant="overline"
                style={{ color: "gray" }}
                gutterBottom
              >
                Statut
              </Typography>
              <Typography
                variant="h6"
                gutterBottom
                style={{ color: checkStatus() }}
              >
                {totalAmountReceived >= total ? "Payé" : status}
              </Typography>
              <Typography
                variant="overline"
                style={{ color: "gray" }}
                gutterBottom
              >
                Date
              </Typography>
              <Typography variant="body2" gutterBottom>
                {moment().format("MMM Do YYYY")}
              </Typography>
              <Typography
                variant="overline"
                style={{ color: "gray" }}
                gutterBottom
              >
                Date d'échéance
              </Typography>
              <Typography variant="body2" gutterBottom>
                {selectedDate
                  ? moment(selectedDate).format("MMM Do YYYY")
                  : "27th Sep 2021"}
              </Typography>
              <Typography variant="overline" gutterBottom>
                Total TTC
              </Typography>
              <Typography variant="h6" gutterBottom>
                TND {toCommas(total)}
              </Typography>
            </Grid>
          </Grid>
        </Container>

        <form>
          <div>
            <TableContainer component={Paper}>
              <Table className={classes.table} aria-label="simple table">
                <TableHead>
                  <TableRow>
                    <TableCell>DESIGNATIONS</TableCell>
                   <TableCell >Person</TableCell>
                    <TableCell>Quantité</TableCell>
                    <TableCell>P.U.H.T</TableCell>
                    {/* <TableCell >Disc(%)</TableCell> */}
                    <TableCell>Montant-HT</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {invoiceData?.items?.map((itemField, index) => (
                    <TableRow key={index}>
                      <TableCell scope="row" style={{ width: "40%" }}>
                        {" "}
                        <InputBase
                          style={{ width: "100%" }}
                          outline="none"
                          sx={{ ml: 1, flex: 1 }}
                          type="text"
                          name="itemName"
                          value={itemField.itemName}
                          placeholder="Item name or description"
                          readOnly
                        />{" "}
                      </TableCell>
                      <TableCell align="right">
                        {" "}
                        <InputBase
                          sx={{ ml: 1, flex: 1 }}
                          type="number"
                          name="person"
                          value={itemField?.person}
                          placeholder="0"
                          readOnly
                        />{" "}
                      </TableCell>
                      <TableCell align="right">
                        {" "}
                        <InputBase
                          sx={{ ml: 1, flex: 1 }}
                          type="number"
                          name="quantity"
                          value={itemField?.quantity}
                          placeholder="0"
                          readOnly
                        />{" "}
                      </TableCell>
                      <TableCell align="right">
                        {" "}
                        <InputBase
                          sx={{ ml: 1, flex: 1 }}
                          type="number"
                          name="unitPrice"
                          value={itemField?.unitPrice}
                          placeholder="0"
                          readOnly
                        />{" "}
                      </TableCell>
                      {/* <TableCell align="right"> <InputBase sx={{ ml: 1, flex: 1 }} type="number" name="discount"  value={itemField?.discount} readOnly /> </TableCell> */}
                      <TableCell align="right">
                        {" "}
                        <InputBase
                          sx={{ ml: 1, flex: 1 }}
                          type="number"
                          name="amount"
                          value={
                            itemField?.quantity * itemField.unitPrice -
                            (itemField.quantity *
                              itemField.unitPrice *
                              itemField.discount) /
                              100
                          }
                          readOnly
                        />{" "}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            <div className={styles.addButton}></div>
          </div>

          <div className={styles.invoiceSummary}>
            <div className={styles.summary}>Résumé de la facture</div>
            <div className={styles.summaryItem}>
              <p>Total H-T:</p>
              <h4>{subTotal}</h4>
            </div>
            <div className={styles.summaryItem}>
              <p>Fodee (1%)</p>
              <h4>{fodee}</h4>
            </div>
            <div className={styles.summaryItem}>
              <p>{`TVA (7%):`}</p>
              <h4>{vat}</h4>
            </div>
            <div className={styles.summaryItem}>
              <p>D.Timbre</p>
              <h4>{dTimbre}</h4>
            </div>
            <div className={styles.summaryItem}>
              <p>D.S.H.T</p>
              <h4>{dsht}</h4>
            </div>
            <div className={styles.summaryItem}>
              <p>Total TTC</p>
              <h4>
                TND{toCommas(total)}
              </h4>
            </div>
            <div className={styles.summaryItem}>
              <p>Pyé</p>
              <h4>
                TND{toCommas(totalAmountReceived)}
              </h4>
            </div>

            <div className={styles.summaryItem}>
              <p>Reste</p>
              <h4
                style={{ color: "black", fontSize: "18px", lineHeight: "8px" }}
              >
               TND{toCommas(total - totalAmountReceived)}
              </h4>
            </div>
          </div>

          <div className={styles.note}>
            <h4 style={{ marginLeft: "-10px" }}>Arréte la présente facture à la somme de:</h4>
            <p style={{ fontSize: "14px" }}>{invoiceData.notes}</p>
          </div>

          {/* <button className={styles.submitButton} type="submit">Save and continue</button> */}
        </form>
      </div>
    </div>
  );
};

export default InvoiceDetails;
