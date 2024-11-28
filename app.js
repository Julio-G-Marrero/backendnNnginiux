const express = require('express');
const Firebird = require('node-firebird');
const cors = require('cors');
const app = express();
const PORT = 3000;

app.use(cors({
  origin: '*',  // Permitir solicitudes desde cualquier origen
  methods: ["GET", "POST", "PATCH", "DELETE"],  // Métodos permitidos
  allowedHeaders: ["Content-Type", "Authorization"],  // Encabezados permitidos
}));

const options = {
    host: 'niux.servehttp.com',  // Dirección IP o hostname de Firebird
    port: 3050,                 // Puerto de Firebird
    database: 'C:\\JULIOGARCIA\\SISTCRASH.GDB',  // Ruta de la base de datos
    user: 'SYSDBA',              // Usuario de Firebird
    password: 'masterkey',       // Contraseña de Firebird
};

app.options('*', cors());

// Ruta para obtener la lista de tablas
app.get('/tablas', (req, res) => {
    Firebird.attach(options, function(err, db) {
      if (err) {
        console.error('Error al conectar con la base de datos:', err);
        return res.status(500).json({ error: 'Error de conexión a la base de datos' });
      }
  
      // Consulta para obtener las tablas
      const query = "SELECT RDB$RELATION_NAME FROM RDB$RELATIONS WHERE RDB$SYSTEM_FLAG = 0";
  
      db.query(query, [], function(err, result) {
        if (err) {
          console.error('Error al ejecutar la consulta:', err);
          db.detach();
          return res.status(500).json({ error: 'Error al ejecutar la consulta' });
        }
  
        // Devuelve el resultado de las tablas
        res.json({ tablas: result });
  
        // Cierra la conexión
        db.detach();
      });
    });
});
  
// Ruta para obtener los registros de la tabla FACTURADOS
app.get('/facturados', (req, res) => {
    Firebird.attach(options, function(err, db) {
      if (err) {
        console.error('Error al conectar con la base de datos:', err);
        return res.status(500).json({ error: 'Error de conexión a la base de datos' });
      }
  
      // Consulta para obtener los registros de la tabla FACTURADOS
      const query = 'SELECT * FROM FACTURADOS';
  
      db.query(query, [], function(err, result) {
        if (err) {
          console.error('Error al ejecutar la consulta:', err);
          db.detach();
          return res.status(500).json({ error: 'Error al ejecutar la consulta' });
        }
  
        // Devuelve el resultado de los registros
        res.json({ registros: result });
  
        // Cierra la conexión
        db.detach();
      });
    });
});

// Ruta para obtener los registros de la tabla ordenes por id
app.get('/ordenes/:noOrden', (req, res) => {
  const noOrden = req.params.noOrden;  // Obtener el valor de NO_ORDEN desde la URL

  // Conectar a la base de datos Firebird
  Firebird.attach(options, (err, db) => {
    if (err) {
      console.error('Error al conectar a la base de datos:', err.message);
      return res.status(500).json({ error: 'Error al conectar a la base de datos' });
    }

    // Consulta SQL para obtener los registros con el NO_ORDEN dado
    const query = `
      SELECT 
        FECHA_PROMESA,
        FECHA,
        PRECIO,
        HORA_ALTA,
        REVISADO_POR,
        AUTORIZADO_POR,
        CANTIDAD,
        TOTAL_COSTO,
        AUTORIZADO,
        STATUS,
        MOTIVO_CANC,
        ORDEN,
        NO_PROVEEDOR,
        NO_ORDEN,
        ES_INSUMO_CONSUMO,
        CANTIDAD2,
        DESCR_PIEZA,
        FACTURA_PROV
      FROM 
        ORDENES_COMPRA
      WHERE 
        NO_ORDEN = ?;
    `;

    // Ejecutar la consulta con el valor de noOrden
    db.query(query, [noOrden], (err, results) => {
      if (err) {
        console.error('Error al ejecutar la consulta:', err.message);
        db.detach();
        return res.status(500).json({ error: 'Error al ejecutar la consulta' });
      }

      // Si no se encuentra ningún resultado
      if (results.length === 0) {
        db.detach();
        return res.status(404).json({ message: 'No se encontraron resultados para el NO_ORDEN dado' });
      }

      // Enviar los resultados como respuesta en formato JSON
      res.json({ resultados: results });

      db.detach();  // Desconectar de la base de datos
    });
  });
});

// Ruta para obtener los registros de la tabla FACTURADOS
app.get('/refacciones', (req, res) => {
    Firebird.attach(options, function(err, db) {
      if (err) {
        console.error('Error al conectar con la base de datos:', err);
        return res.status(500).json({ error: 'Error de conexión a la base de datos' });
      }
  
      // Consulta para obtener los registros de la tabla FACTURADOS
      const query = 'SELECT * FROM REFACCIONES';
  
      db.query(query, [], function(err, result) {
        if (err) {
          console.error('Error al ejecutar la consulta:', err);
          db.detach();
          return res.status(500).json({ error: 'Error al ejecutar la consulta' });
        }
  
        // Devuelve el resultado de los registros
        res.json({ registros: result });
  
        // Cierra la conexión
        db.detach();
      });
    });
});

app.get('/nomina', (req, res) => {
  const noPeriodo = req.query.noPeriodo; // Toma el valor de NO_PERIODO desde el query parameter

  if (!noPeriodo) {
    return res.status(400).json({ error: 'El parámetro "noPeriodo" es obligatorio' });
  }

  // Conectar a la base de datos
  Firebird.attach(options, (err, db) => {
    if (err) {
      console.error('Error al conectar a la base de datos:', err);
      return res.status(500).json({ error: 'Error al conectar a la base de datos' });
    }

    // Ejecutar la consulta SQL
    db.query('SELECT * FROM NOMINA WHERE NO_PERIODO = ?', [noPeriodo], (err, result) => {
      db.detach(); // Cerrar la conexión a la base de datos

      if (err) {
        console.error('Error al ejecutar la consulta:', err);
        return res.status(500).json({ error: 'Error al ejecutar la consulta' });
      }

      // Retornar los resultados como respuesta JSON
      res.json(result);
    });
  });
});
// Inicia el servidor
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});