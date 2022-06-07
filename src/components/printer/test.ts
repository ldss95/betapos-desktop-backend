/*
import escpos from 'escpos';
escpos.Network = require('escpos-network');

function testPrinter(){
    const device = new escpos.Network('10.0.0.2')
    const printer = new escpos.Printer(device);
    device.open(function(error){
        if(error){
            return console.log(error)
        }

        printer
            .align('CT')
            .text('BON METRO PLAZA')
            .text('Av.Charles Summer')
            .text('DANDELION SRL')
            .text('--------')
            .text('RNC: 130894035')
            .text('Carry Out')
            .text('ACOGIDOS AL RTS')
            .text('Factura para consumidor final')
            .text('NCF 00000000B0200120074')
            .newLine()
            .text('*** LLEVAR ***')
            .table(['FACTURA', 'ORDEN', 'FECHA', 'CAJA', 'HORA'])
            .table(['241155', '12', '06/06/2022', '1', '01:51 PM'])
            .newLine()
            .table(['CANT', 'PRODUCTO', 'ITBIS', 'PRECIO', 'TOTAL'])
            .text('-------------------------------')
            .table(['2.0', 'yf yogurt griego 8 onza'])
            .table(['', '', '56.44', '156.78', '370.00'])
            .text('-------------------------------')
            .table(['', 'SUBTOTAL', '313.56'])
            .table(['', 'ITBIS', '56.44'])
            .table(['', 'TOTAL', '370.00'])
            .newLine()
            .align('LT')
            .text('Gracias por su compra')
            .newLine()

            printer.cut();
            printer.close();
    })
}
*/

import {
    printer as ThermalPrinter,
    types as PrinterTypes
} from 'node-thermal-printer';


async function testPrinter(){
    const printer = new ThermalPrinter({
        // type: PrinterTypes.EPSON,
        interface: 'tcp://10.0.0.2',
    })

    const isConnected = await printer.isPrinterConnected();
    if(!isConnected){
        return console.warn('Printer is not connected')
    }

    printer.alignCenter();
    printer.setTextDoubleHeight();
    printer.setTextDoubleWidth();
    printer.println('BON METRO PLAZA')
    printer.newLine()
    printer.setTextNormal();
    printer.println('Av.Charles Summer')
    printer.println('DANDELION SRL')
    printer.println('--------')
    printer.println('RNC: 130894035')
    printer.println('Carry Out')
    printer.println('ACOGIDOS AL RTS')
    printer.println('Factura para consumidor final')
    printer.println('NCF 00000000B0200120074')
    printer.newLine();
    printer.println('*** LLEVAR ***')
    printer.tableCustom([
        {
            text: 'FACTURA',
        },
        {
            text: 'ORDEN',
        },
        {
            text: 'FECHA',
        },
        {
            text: 'CAJA',
        },
        {
            text: 'HORA',
        }
    ])
    // printer.table(['FACTURA', 'ORDEN', 'FECHA', 'CAJA', 'HORA'])
    printer.table(['241155', '12', '06/06/2022', '1', '01:51 PM'])
    printer.newLine()
    printer.table(['CANT', 'PRODUCTO', 'ITBIS', 'PRECIO', 'TOTAL'])
    printer.drawLine();
    printer.table(['2.0', 'yf yogurt griego 8 onza', '', '', ''])
    printer.table(['', '', '56.44', '156.78', '370.00'])
    printer.drawLine();
    printer.table(['', 'SUBTOTAL', '313.56'])
    printer.table(['', 'ITBIS', '56.44'])
    printer.table(['', 'TOTAL', '370.00'])
    printer.newLine()
    printer.println('Gracias por su compra')
    printer.newLine()

    printer.cut();
    printer.execute();
}

export { testPrinter }
