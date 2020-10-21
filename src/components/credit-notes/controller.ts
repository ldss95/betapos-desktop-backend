import { Request, Response } from 'express';
import { UniqueConstraintError } from 'sequelize'

import { CreditNote } from './model'
import { CreditNoteProduct } from '../credit-note-products/model'
import { Ticket } from '../tickets/model'
import { Product } from '../products/model'

export default {
    create: (req: Request, res: Response) => {
        const data = req.body
        data.userId = req.session!.user.id

        CreditNote.create(data, { include: { model: CreditNoteProduct, as: 'products' } })
            .then(() => res.sendStatus(201))
            .catch(error => {
                if (error instanceof UniqueConstraintError) {
                    res.status(400).send({ message: 'Ya existe una nota de credito para esta factura.' })
                    return
                }

                res.sendStatus(500)
                throw error
            })
    },
    getOne: (req: Request, res: Response) => {
        const { ticketNumber } = req.params

        Ticket.findOne({
            where: { ticketNumber },
            include: [
                {
                    model: CreditNote,
                    include: [
                        {
                            model: Product,
                            as: 'products'
                        }
                    ]
                }
            ]
        }).then(ticket => res.status(200).send(ticket))
            .catch(error => {
                res.sendStatus(500)
                throw error
            })
    }
};
