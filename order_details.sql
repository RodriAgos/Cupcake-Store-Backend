-- Table: public.order_details

-- DROP TABLE IF EXISTS public.order_details;

CREATE TABLE IF NOT EXISTS public.order_details
(
    order_detail_id integer NOT NULL DEFAULT nextval('order_details_order_detail_id_seq'::regclass),
    order_id integer,
    cupcake_id integer,
    quantity integer NOT NULL,
    CONSTRAINT order_details_pkey PRIMARY KEY (order_detail_id),
    CONSTRAINT order_details_cupcake_id_fkey FOREIGN KEY (cupcake_id)
        REFERENCES public.products (cupcake_id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION,
    CONSTRAINT order_details_order_id_fkey FOREIGN KEY (order_id)
        REFERENCES public.orders (order_id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE CASCADE,
    CONSTRAINT order_details_quantity_check CHECK (quantity > 0)
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.order_details
    OWNER to postgres;